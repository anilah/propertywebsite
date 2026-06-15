import express from 'express';
import {
  getPresignedUploadUrl,
  getUploadConfig,
  handleLocalUpload,
  localUploadMiddleware,
} from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Config check — no auth needed
router.get('/config', getUploadConfig);

// S3 presign — authenticated users only
router.post('/presign', authenticate, getPresignedUploadUrl);

// Local disk upload — authenticated, dev/no-S3 fallback
router.post('/local', authenticate, localUploadMiddleware, handleLocalUpload);

export { router as uploadRouter };
