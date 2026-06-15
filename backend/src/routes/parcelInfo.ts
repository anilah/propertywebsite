import express from 'express';
import { getParcelInfoHandler } from '../controllers/parcelInfoController.js';

const router = express.Router();

router.get('/', getParcelInfoHandler);

export { router as parcelInfoRouter };
