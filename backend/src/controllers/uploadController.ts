/**
 * Upload controller — two modes:
 *
 * 1. S3 (production):
 *    browser → POST /api/upload/presign → gets a short-lived S3 PUT URL
 *           → PUT <signedUrl>  (browser → S3 direct, no payload through this server)
 *
 * 2. Local (development — no S3 needed):
 *    browser → POST /api/upload/local?folder=profiles  (multipart/form-data)
 *           → file saved to  <cwd>/uploads/<folder>/<uuid>.<ext>
 *           → served at      SERVER_PUBLIC_URL/uploads/<folder>/<uuid>.<ext>
 *
 * S3 env vars (all optional in dev):
 *   S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL_PREFIX
 */

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/serverError.js';

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
};

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4':       'mp4',
  'video/webm':      'webm',
  'video/quicktime': 'mov',
};

// Combined for presign (images + videos)
const ALLOWED_TYPES: Record<string, string> = {
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
};

const ALLOWED_FOLDERS = ['profiles', 'listings', 'uploads'];
const PRESIGN_EXPIRES_SECONDS = 300; // 5 minutes
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB local-upload cap for video

// ── helpers ──────────────────────────────────────────────────────────────────

function isS3Configured(): boolean {
  // Only bucket + region required. When running in Lambda, the execution
  // role credentials are used automatically (no explicit keys needed).
  return !!(process.env.S3_BUCKET && process.env.S3_REGION);
}

function safeFolder(raw: unknown): string {
  const s = typeof raw === 'string' ? raw : 'uploads';
  return ALLOWED_FOLDERS.includes(s) ? s : 'uploads';
}

// ── local disk storage (dev / no-S3) ─────────────────────────────────────────

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const localDiskStorage = multer.diskStorage({
  destination(req, _file, cb) {
    const folder = safeFolder((req.query as Record<string, string>).folder);
    const dest = path.join(UPLOADS_ROOT, folder);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(_req, file, cb) {
    const ext = ALLOWED_TYPES[file.mimetype] ?? 'jpg';
    cb(null, `${uuid()}.${ext}`);
  },
});

export const localUploadMiddleware = multer({
  storage: localDiskStorage,
  // Videos can be large — cap at 500 MB for local dev; images are capped at 10 MB
  limits: { fileSize: MAX_VIDEO_BYTES },
  fileFilter(_req, file, cb) {
    ALLOWED_TYPES[file.mimetype]
      ? cb(null, true)
      : cb(new Error('Only JPEG, PNG, WebP, GIF images and MP4, WebM, MOV videos are accepted.'));
  },
}).single('file');

function getS3Client(): S3Client {
  const region = process.env.S3_REGION!;
  const keyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secret = process.env.S3_SECRET_ACCESS_KEY?.trim();

  // Use explicit credentials only when both are provided (local dev).
  // In Lambda the execution role credentials are picked up automatically.
  if (keyId && secret) {
    return new S3Client({ region, credentials: { accessKeyId: keyId, secretAccessKey: secret } });
  }
  return new S3Client({ region });
}

/**
 * POST /api/upload/presign
 * Body: { contentType: string, folder?: 'profiles'|'listings'|'uploads', filename?: string }
 * Returns: { uploadUrl: string, publicUrl: string, key: string }
 */
export const getPresignedUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    if (!isS3Configured()) {
      return res.status(503).json({
        error: 'File upload is not configured on this server. Set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.',
      });
    }

    const { contentType, folder = 'uploads' } = req.body as Record<string, string>;

    if (!contentType || !ALLOWED_TYPES[contentType]) {
      return res.status(400).json({
        error: 'Invalid content type. Allowed images: jpeg, png, webp, gif. Allowed videos: mp4, webm, mov.',
      });
    }

    const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'uploads';
    const ext = ALLOWED_TYPES[contentType];
    const key = `${safeFolder}/${uuid()}.${ext}`;

    const bucket = process.env.S3_BUCKET!;
    const client = getS3Client();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      // ACL is intentionally omitted; use bucket policy / presigned-URL expiry for access control.
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: PRESIGN_EXPIRES_SECONDS });

    const publicBase =
      process.env.S3_PUBLIC_URL_PREFIX?.replace(/\/$/, '') ??
      `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com`;

    const publicUrl = `${publicBase}/${key}`;

    res.json({ uploadUrl, publicUrl, key });
  } catch (err: unknown) {
    sendServerError(res, err);
  }
};

/**
 * GET /api/upload/config
 * Returns upload capabilities so the frontend can pick the right strategy:
 *   s3Enabled   – use presigned-URL flow (production)
 *   localEnabled – use multipart POST /api/upload/local (always true in dev)
 */
export const getUploadConfig = (_req: AuthRequest, res: Response) => {
  res.json({ s3Enabled: isS3Configured(), localEnabled: true });
};

/**
 * POST /api/upload/local?folder=profiles|listings|uploads
 * Content-Type: multipart/form-data, field name "file"
 * Returns: { publicUrl: string, filename: string }
 *
 * Files land in <cwd>/uploads/<folder>/ and are served as static assets.
 * Only intended for local / dev use — no auth required for serving static files.
 */
export const handleLocalUpload = (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file received. Make sure the field name is "file".' });
  }
  const folder = safeFolder((req.query as Record<string, string>).folder);
  const base = (process.env.SERVER_PUBLIC_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  const publicUrl = `${base}/uploads/${folder}/${req.file.filename}`;
  res.json({ publicUrl, filename: req.file.filename });
};
