import express from 'express';
import {
  metaLeadWebhookVerify,
  metaLeadWebhookReceive,
  googleLeadWebhook,
  tiktokLeadWebhook,
} from '../controllers/campaignLeadsController.js';

const router = express.Router();

// Public — no authentication. Configure these URLs in each platform dashboard:
//   Meta:    GET/POST https://your-api/api/webhooks/meta
//   Google:  POST     https://your-api/api/webhooks/google
//   TikTok:  POST     https://your-api/api/webhooks/tiktok
router.get('/meta',    metaLeadWebhookVerify);
router.post('/meta',   metaLeadWebhookReceive);
router.post('/google', googleLeadWebhook);
router.post('/tiktok', tiktokLeadWebhook);

export { router as campaignWebhooksRouter };
