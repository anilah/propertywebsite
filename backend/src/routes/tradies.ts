import express from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import {
  listPublicTradies, listPublicTradieCategories, getPublicTradie, createTradieEnquiry,
  recordTradieContactClick,
  adminListTradies, adminGetTradie, adminCreateTradie, adminUpdateTradie, adminDeleteTradie,
} from '../controllers/tradiesController.js';

// Public — no auth required
const tradiesRouter = express.Router();
tradiesRouter.get('/', listPublicTradies);
tradiesRouter.get('/categories', listPublicTradieCategories);
tradiesRouter.get('/:slug', getPublicTradie);
tradiesRouter.post('/:id/enquire', createTradieEnquiry);
tradiesRouter.post('/:id/contact-click', recordTradieContactClick);

// Admin — super admin only
const adminTradiesRouter = express.Router();
adminTradiesRouter.use(authenticate, requireSuperAdmin);
adminTradiesRouter.get('/', adminListTradies);
adminTradiesRouter.post('/', adminCreateTradie);
adminTradiesRouter.get('/:id', adminGetTradie);
adminTradiesRouter.put('/:id', adminUpdateTradie);
adminTradiesRouter.delete('/:id', adminDeleteTradie);

export { tradiesRouter, adminTradiesRouter };
