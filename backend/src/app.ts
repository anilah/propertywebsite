import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { getSwaggerDocument } from './swagger.js';
import { listingsRouter, adminListingsRouter, adminEnquiriesRouter } from './routes/listings.js';
import { authRouter } from './routes/auth.js';
import { agentsRouter } from './routes/agents.js';
import { uploadRouter } from './routes/upload.js';
import { parcelInfoRouter } from './routes/parcelInfo.js';
import { schoolZonesRouter } from './routes/schoolZones.js';
import { geocodeRouter } from './routes/geocode.js';
import { campaignsRouter } from './routes/campaigns.js';
import { campaignWebhooksRouter } from './routes/campaignWebhooks.js';
import { integrationsRouter } from './routes/integrations.js';
import brandingRouter from './routes/branding.js';
import { contentRouter } from './routes/content.js';
import { tradiesRouter, adminTradiesRouter } from './routes/tradies.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { getSiteConfig } from './controllers/siteConfigController.js';

/** Comma-separated `CORS_ORIGIN`, e.g. `https://d4ua3a4iyx8c3.cloudfront.net,http://localhost:5173` */
function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) {
    throw new Error('CORS_ORIGIN is required. Set it in backend/.env or Lambda environment variables.');
  }
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) {
    throw new Error('CORS_ORIGIN is set but empty. Provide one or more origins separated by commas.');
  }
  return list;
}

/**
 * API Gateway sometimes forwards OPTIONS to Lambda without an `Origin` header. The static `cors`
 * array origin then omits `Access-Control-Allow-*` on preflight, so the browser blocks POST.
 * This callback always resolves to a single allowed origin string for the middleware.
 */
function corsOriginDelegate(
  requestOrigin: string | undefined,
  callback: (err: Error | null, allow?: string | boolean) => void
): void {
  const allowed = getAllowedOrigins();
  const primary = allowed[0];
  if (!requestOrigin) {
    callback(null, primary);
    return;
  }
  if (allowed.includes(requestOrigin)) {
    callback(null, requestOrigin);
    return;
  }
  callback(new Error('Not allowed by CORS'));
}

export function createApp() {
  const app = express();

  app.use(requestLogger);

  // Security headers (CSP disabled: JSON API + optional Swagger UI; edge/WAF can add stricter CSP)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );

  app.use(
    cors({
      origin: corsOriginDelegate,
      credentials: true,
    })
  );
  // Express defaults to 100kb which is too small for base64 image payloads.
  // Keep this reasonably bounded to avoid accidental memory blowups.
  const jsonLimit = process.env.JSON_BODY_LIMIT || '30mb';
  const urlencodedLimit = process.env.URLENCODED_BODY_LIMIT || jsonLimit;
  app.use(express.json({ limit: jsonLimit }));
  app.use(express.urlencoded({ extended: true, limit: urlencodedLimit }));

  // Swagger — off in production unless explicitly enabled (reduces API surface disclosure)
  if (process.env.NODE_ENV !== 'production' || process.env.API_DOCS_ENABLED === 'true') {
    app.use(
      '/api-docs',
      swaggerUi.serve,
      (req: Request, res: Response, next: NextFunction) => {
        swaggerUi.setup(getSwaggerDocument(req))(req, res, next);
      }
    );
  }

  // Health check — set Lambda env DEPLOY_TAG (e.g. 2026-03-30-a) to confirm which build is live
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      deployTag: process.env.DEPLOY_TAG ?? null,
      lambdaFunction: process.env.AWS_LAMBDA_FUNCTION_NAME ?? null,
    });
  });

  // Local dev uploads — static files written by POST /api/upload/local
  // In production these are served from S3/CloudFront instead.
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), { maxAge: '1d' })
  );

  // API Routes
  app.get('/api/config/site', getSiteConfig);
  app.use('/api/auth', authRouter);
  app.use('/api/listings', listingsRouter);
  app.use('/api/admin/listings', adminListingsRouter);
  app.use('/api/admin/enquiries', adminEnquiriesRouter);
  app.use('/api/admin/agents', agentsRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/parcel-info', parcelInfoRouter);
  app.use('/api/school-zones', schoolZonesRouter);
  app.use('/api/admin/geocode', geocodeRouter);
  // Campaigns CRUD (super admin only)
  app.use('/api/admin/campaigns', campaignsRouter);
  // Lead capture webhooks (public — no auth — for Meta/Google/TikTok callbacks)
  app.use('/api/webhooks', campaignWebhooksRouter);
  // Platform integration settings (super admin only)
  app.use('/api/admin/integrations', integrationsRouter);
  // Branding settings — GET public, PUT super admin only
  app.use('/api/admin/branding', brandingRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/tradies', tradiesRouter);
  app.use('/api/admin/tradies', adminTradiesRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}

