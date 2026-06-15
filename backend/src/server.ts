import dotenv from 'dotenv';
import { applyDsqlIamDatabaseUrl, scheduleDsqlTokenRefresh } from './config/dsqlDatabaseUrl.js';
import { assertProductionConfig } from './config/env.js';

dotenv.config();
await applyDsqlIamDatabaseUrl();
assertProductionConfig();
scheduleDsqlTokenRefresh();

const { createApp } = await import('./app.js');
const app = createApp();

const portRaw = process.env.PORT?.trim();
if (!portRaw) {
  throw new Error('PORT is required in backend/.env (e.g. PORT=3001).');
}
const PORT = Number(portRaw);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error(`PORT must be an integer 1–65535, got: ${portRaw}`);
}

const serverPublicUrl = process.env.SERVER_PUBLIC_URL?.trim().replace(/\/$/, '');
if (!serverPublicUrl) {
  throw new Error(
    'SERVER_PUBLIC_URL is required in backend/.env (e.g. http://localhost:3001 — used for startup logs and docs link).'
  );
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV ?? '(unset)'}`);
  console.log(`📚 API docs: ${serverPublicUrl}/api-docs`);
});
