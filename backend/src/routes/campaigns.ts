import express from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  addCampaignAsset,
  deleteCampaignAsset,
  publishCampaign,
  finalizeInstagramPublish,
} from '../controllers/campaignsController.js';
import {
  getCampaignLeads,
  getAllLeads,
  updateLead,
  createManualLead,
  deleteLead,
  syncCampaignLeads,
} from '../controllers/campaignLeadsController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

// Campaigns CRUD
router.get('/',           getCampaigns);
router.post('/',          createCampaign);
router.get('/:id',        getCampaign);
router.patch('/:id',      updateCampaign);
router.delete('/:id',     deleteCampaign);

// Campaign publishing
router.post('/:id/publish', publishCampaign);
router.post('/:id/finalize-instagram', finalizeInstagramPublish);

// Campaign assets
router.post('/:id/assets',              addCampaignAsset);
router.delete('/:id/assets/:assetId',   deleteCampaignAsset);

// Campaign leads
router.get('/:id/leads',        getCampaignLeads);
router.post('/:id/sync-leads',  syncCampaignLeads);

// All leads (cross-campaign) & manual entry
router.get('/leads/all',        getAllLeads);
router.post('/leads',           createManualLead);
router.patch('/leads/:id',      updateLead);
router.delete('/leads/:id',     deleteLead);

export { router as campaignsRouter };
