import express from 'express';
import { getSchoolZonesHandler } from '../controllers/schoolZonesController.js';

const router = express.Router();

router.get('/', getSchoolZonesHandler);

export { router as schoolZonesRouter };
