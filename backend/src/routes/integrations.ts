import express from 'express';
import {
  getIntegrations,
  saveIntegration,
  testIntegration,
  deleteIntegration,
} from '../controllers/platformSettingsController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get('/',                       getIntegrations);
router.put('/:platform',              saveIntegration);
router.post('/:platform/test',        testIntegration);
router.delete('/:platform',           deleteIntegration);

export { router as integrationsRouter };
