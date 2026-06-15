import express from 'express';
import { login, changeMyPin } from '../controllers/authController.js';
import { getSetupStatus, createFirstSuperAdmin } from '../controllers/setupController.js';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/setup/status', getSetupStatus);
router.post('/setup/first-super-admin', createFirstSuperAdmin);

// PIN-based login (single step: mobile + PIN → JWT)
router.post('/login', login);

// Self-service profile + PIN (agent or super admin)
router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);
router.patch('/me/pin', authenticate, changeMyPin);

export { router as authRouter };
