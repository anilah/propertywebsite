import { Router } from 'express';
import { getBranding, updateBranding } from '../controllers/brandingController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getBranding);
router.put('/', authenticate, requireSuperAdmin, updateBranding);

export default router;
