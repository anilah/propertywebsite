import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/serverError.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Public endpoints ──────────────────────────────────────────────────────────

/** GET /api/content/posts?type=news|guide&category=&featured=&limit=&page= */
export const listPublicPosts = async (req: Request, res: Response) => {
  try {
    const { type, category, featured, limit = '20', page = '1' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const where: Record<string, unknown> = { published: true };
    if (type) where.type = type;
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const [posts, total] = await Promise.all([
      prisma.contentPost.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        take,
        skip,
        select: {
          id: true, slug: true, type: true, title: true, excerpt: true,
          imageUrl: true, category: true, featured: true, readTime: true,
          sortOrder: true, createdAt: true,
        },
      }),
      prisma.contentPost.count({ where }),
    ]);

    res.json({ posts, total, page: parseInt(page) || 1, limit: take });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/content/posts/:slug */
export const getPublicPost = async (req: Request, res: Response) => {
  try {
    const post = await prisma.contentPost.findFirst({
      where: { slug: req.params.slug, published: true },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

// ── Admin endpoints ───────────────────────────────────────────────────────────

/** GET /api/admin/content?type=news|guide&page=&limit= */
export const adminListPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { type, limit = '50', page = '1' } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit) || 50, 200);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;
    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const [posts, total] = await Promise.all([
      prisma.contentPost.findMany({
        where,
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        take, skip,
      }),
      prisma.contentPost.count({ where }),
    ]);
    res.json({ posts, total });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** POST /api/admin/content */
export const adminCreatePost = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type, title, excerpt, body, imageUrl, category,
      featured, published, readTime, sortOrder, slug: rawSlug,
    } = req.body ?? {};

    if (!type || !['news', 'guide'].includes(type)) {
      return res.status(400).json({ error: 'type must be "news" or "guide"' });
    }
    if (!String(title ?? '').trim()) return res.status(400).json({ error: 'title is required' });
    if (!String(excerpt ?? '').trim()) return res.status(400).json({ error: 'excerpt is required' });
    if (!body) return res.status(400).json({ error: 'body is required' });

    const slug = rawSlug ? slugify(String(rawSlug)) : slugify(String(title));
    if (!slug) return res.status(400).json({ error: 'Could not generate a valid slug from the title' });

    const existing = await prisma.contentPost.findUnique({ where: { slug } });
    if (existing) return res.status(409).json({ error: `Slug "${slug}" is already in use` });

    const post = await prisma.contentPost.create({
      data: {
        slug,
        type: String(type),
        title: String(title).trim(),
        excerpt: String(excerpt).trim(),
        body,
        imageUrl: imageUrl ? String(imageUrl).trim() || null : null,
        category: category ? String(category).trim() || null : null,
        featured: Boolean(featured),
        published: published === undefined ? true : Boolean(published),
        readTime: readTime ? String(readTime).trim() || null : null,
        sortOrder: parseInt(sortOrder) || 0,
        createdBy: req.user?.id ?? null,
      },
    });
    res.status(201).json({ post });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** GET /api/admin/content/:id */
export const adminGetPost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.contentPost.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** PUT /api/admin/content/:id */
export const adminUpdatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.contentPost.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Post not found' });

    const {
      title, excerpt, body, imageUrl, category,
      featured, published, readTime, sortOrder, slug: rawSlug,
    } = req.body ?? {};

    const slug = rawSlug ? slugify(String(rawSlug)) : undefined;
    if (slug && slug !== existing.slug) {
      const clash = await prisma.contentPost.findUnique({ where: { slug } });
      if (clash) return res.status(409).json({ error: `Slug "${slug}" is already in use` });
    }

    const post = await prisma.contentPost.update({
      where: { id },
      data: {
        ...(slug ? { slug } : {}),
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(excerpt !== undefined ? { excerpt: String(excerpt).trim() } : {}),
        ...(body !== undefined ? { body } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl ? String(imageUrl).trim() || null : null } : {}),
        ...(category !== undefined ? { category: category ? String(category).trim() || null : null } : {}),
        ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
        ...(published !== undefined ? { published: Boolean(published) } : {}),
        ...(readTime !== undefined ? { readTime: readTime ? String(readTime).trim() || null : null } : {}),
        ...(sortOrder !== undefined ? { sortOrder: parseInt(sortOrder) || 0 } : {}),
      },
    });
    res.json({ post });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};

/** DELETE /api/admin/content/:id */
export const adminDeletePost = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.contentPost.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Post not found' });
    await prisma.contentPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: unknown) {
    sendServerError(res, error);
  }
};
