import express from 'express';
import {
  getPendingAgents,
  getAgents,
  createAgent,
  updateAgent,
  getAgentListings,
  approveAgent,
  activateAgent,
  deactivateAgent,
  resetAgentPin,
} from '../controllers/agentsController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Unauthenticated API discovery — disabled in production by default (reduces attack surface).
 * Set EXPOSE_ADMIN_API_INFO=true to enable (e.g. partner integration docs behind a gateway).
 */
if (process.env.NODE_ENV !== 'production' || process.env.EXPOSE_ADMIN_API_INFO === 'true') {
  router.get('/info', (_req, res) => {
    res.json({
      description:
        'Agent management API (super admin only). Use Bearer JWT from POST /api/auth/otp/verify.',
      endpoints: [
        { method: 'GET', path: '/api/admin/agents/pending', description: 'List users pending approval (legacy)' },
        { method: 'GET', path: '/api/admin/agents', description: 'List agents (q, status, sort, order, page, pageSize)' },
        { method: 'GET', path: '/api/admin/agents/:id/listings', description: "Agent's listings (paginated)" },
        { method: 'POST', path: '/api/admin/agents', description: 'Create agent manually (mobile + profile)' },
        { method: 'POST', path: '/api/admin/agents/:id/approve', description: 'Onboard: approve pending user as agent' },
        { method: 'PATCH', path: '/api/admin/agents/:id', description: 'Update agent profile / mobile' },
        { method: 'PATCH', path: '/api/admin/agents/:id/activate', description: 'Activate agent' },
        { method: 'PATCH', path: '/api/admin/agents/:id/deactivate', description: 'Deactivate agent' },
        { method: 'POST', path: '/api/admin/agents/:id/reset-pin', description: 'Reset agent login PIN; returns plain PIN once for super admin to share' },
      ],
      tables: ['users (id, mobileNumber, role, isActive, createdAt, updatedAt). role: SUPER_ADMIN | AGENT | PENDING'],
    });
  });
}

router.use(authenticate, requireSuperAdmin);

router.get('/pending', getPendingAgents);
router.post('/', createAgent);
router.get('/', getAgents);
router.post('/:id/approve', approveAgent);
router.patch('/:id/activate', activateAgent);
router.patch('/:id/deactivate', deactivateAgent);
router.post('/:id/reset-pin', resetAgentPin);
router.get('/:id/listings', getAgentListings);
router.patch('/:id', updateAgent);

export { router as agentsRouter };
