import express from 'express';
import { geocodeHandler } from '../controllers/geocodeController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin-only — avoids exposing a free third-party geocoding proxy publicly.
router.get('/', authenticate, requireAdmin, geocodeHandler);

export { router as geocodeRouter };
