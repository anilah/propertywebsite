import express from 'express';
import {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  createEnquiry,
  getPendingApprovalListings,
  approveListingPublish,
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
router.get('/:id', authenticateOptional, getListingById);

// Protected agent routes (list/manage property)
router.post('/', authenticate, requireAdmin, createListing);
router.put('/:id', authenticate, requireAdmin, updateListing);
router.delete('/:id', authenticate, requireAdmin, deleteListing);

export { router as listingsRouter };
