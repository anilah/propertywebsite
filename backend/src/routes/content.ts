import express from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import {
  listPublicPosts, getPublicPost,
  adminListPosts, adminCreatePost, adminGetPost, adminUpdatePost, adminDeletePost,
} from '../controllers/contentController.js';

const router = express.Router();

// Public — no auth required
router.get('/posts', listPublicPosts);
router.get('/posts/:slug', getPublicPost);

// Admin — super admin only
router.get('/admin', authenticate, requireSuperAdmin, adminListPosts);
router.post('/admin', authenticate, requireSuperAdmin, adminCreatePost);
router.get('/admin/:id', authenticate, requireSuperAdmin, adminGetPost);
router.put('/admin/:id', authenticate, requireSuperAdmin, adminUpdatePost);
router.delete('/admin/:id', authenticate, requireSuperAdmin, adminDeletePost);

export { router as contentRouter };
