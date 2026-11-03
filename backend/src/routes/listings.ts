import express from 'express';
import {
  getListings,
  getMyListings,
  getListingById,
  getMoreFromAgentOrAgency,
  createListing,
  updateListing,
  deleteListing,
  createEnquiry,
  listEnquiries,
  getPendingApprovalListings,
  approveListingPublish,
  adminGetListings,
  getListingMarketing,
  addListingMarketing,
  deleteListingMarketing,
} from '../controllers/listingsController.js';
import { authenticate, authenticateOptional, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { requirePublicListingsBrowseEnabled } from '../middleware/publicListingsBrowse.js';

const router = express.Router();

// Public browse (optional; disable with PUBLIC_LISTINGS_API_ENABLED=false)
router.get('/', requirePublicListingsBrowseEnabled, getListings);
// Agent's own listings (must be before /:id)
router.get('/my', authenticate, requireAdmin, getMyListings);
router.get('/pending-approval', authenticate, requireSuperAdmin, getPendingApprovalListings);
router.post('/:id/enquiries', requirePublicListingsBrowseEnabled, createEnquiry);
router.post('/:id/approve-publish', authenticate, requireSuperAdmin, approveListingPublish);

// Marketing media (photos / videos / reels for campaign use)
router.get('/:id/marketing',             authenticate, requireAdmin, getListingMarketing);
router.post('/:id/marketing',            authenticate, requireAdmin, addListingMarketing);
router.delete('/:id/marketing/:mediaId', authenticate, requireAdmin, deleteListingMarketing);
router.get('/:id/more-from', requirePublicListingsBrowseEnabled, getMoreFromAgentOrAgency);

router.get('/:id', authenticateOptional, getListingById);

// Protected agent routes (list/manage property)
router.post('/', authenticate, requireAdmin, createListing);
router.put('/:id', authenticate, requireAdmin, updateListing);
router.delete('/:id', authenticate, requireAdmin, deleteListing);

export { router as listingsRouter };

// Admin sub-router — mounted at /api/admin/listings
const adminRouter = express.Router();
adminRouter.get('/', authenticate, requireSuperAdmin, adminGetListings);
export { adminRouter as adminListingsRouter };

// Admin enquiries — mounted at /api/admin/enquiries
const adminEnquiriesRouter = express.Router();
adminEnquiriesRouter.get('/', authenticate, requireSuperAdmin, listEnquiries);
export { adminEnquiriesRouter };
