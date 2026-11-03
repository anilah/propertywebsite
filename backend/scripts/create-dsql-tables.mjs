#!/usr/bin/env node
/**
 * Creates all application tables on Aurora DSQL using DSQL-compatible DDL.
 *
 * Prisma's `db push` is not compatible with Aurora DSQL because DSQL:
 *  - does not support  CREATE TYPE ... AS ENUM
 *  - does not support  standalone CREATE [UNIQUE] INDEX  (use CREATE INDEX ASYNC instead)
 *  - does not support  ALTER TABLE DROP CONSTRAINT
 *
 * This script creates tables with inline UNIQUE / PRIMARY KEY constraints,
 * which DSQL accepts as part of CREATE TABLE. It is idempotent (IF NOT EXISTS).
 *
 * Usage:
 *   npm run db:create:dsql            # create tables
 *   npm run db:indexes:dsql           # create async indexes
 *
 * Column names match Prisma schema field names exactly (Prisma keeps camelCase).
 */
import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });
const prodEnv = resolve(root, '.env.production');
if (existsSync(prodEnv)) config({ path: prodEnv, override: true });
const prodProdEnv = resolve(root, '.env.production.prod');
if (existsSync(prodProdEnv)) config({ path: prodProdEnv, override: true });

const host = process.env.AURORA_DSQL_HOST?.trim();
const region =
  process.env.AURORA_DSQL_REGION?.trim() ||
  process.env.AWS_REGION?.trim() ||
  'ap-southeast-2';

if (!host) {
  console.error('Set AURORA_DSQL_HOST in backend/.env');
  process.exit(1);
}

let token;
try {
  token = execFileSync(
    'aws',
    ['dsql', 'generate-db-connect-admin-auth-token', '--expires-in', '900', '--region', region, '--hostname', host],
    { encoding: 'utf8' }
  ).trim();
} catch (e) {
  console.error(e?.stderr?.toString?.() || e?.message || e);
  process.exit(1);
}

const client = new pg.Client({
  host,
  port: 5432,
  database: process.env.AURORA_DSQL_DATABASE?.trim() || 'postgres',
  user: process.env.AURORA_DSQL_USER?.trim() || 'admin',
  password: token,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

// Tables in creation order (parents before children)
const statements = [
  // ── users ─────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id              TEXT        PRIMARY KEY,
    "mobileNumber"  TEXT        NOT NULL UNIQUE,
    role            TEXT        NOT NULL DEFAULT 'PENDING',
    pin             TEXT,
    "isActive"      BOOLEAN     NOT NULL DEFAULT true,
    "firstName"     TEXT,
    "lastName"      TEXT,
    email           TEXT,
    "agencyName"    TEXT,
    "licenseNumber" TEXT,
    "profilePhotoUrl" TEXT,
    "officeBranchName" TEXT,
    "officePhone"   TEXT,
    "officeWebsite" TEXT,
    "appraisalUrl"  TEXT,
    "platinumPartner" BOOLEAN NOT NULL DEFAULT false,
    "listingAgentDisplayName" TEXT,
    "listingAgentPhotoUrl" TEXT,
    "coListingAgentName" TEXT,
    "coListingAgentPhotoUrl" TEXT,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  // ── listings ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS listings (
    id                        TEXT        PRIMARY KEY,
    "listingType"             TEXT        NOT NULL,
    status                    TEXT        NOT NULL DEFAULT 'DRAFT',
    headline                  TEXT        NOT NULL,
    description               TEXT        NOT NULL,
    "propertyType"            TEXT        NOT NULL,
    region                    TEXT        NOT NULL,
    district                  TEXT        NOT NULL,
    suburb                    TEXT        NOT NULL,
    "streetAddress"           TEXT,
    city                      TEXT,
    "postalCode"              TEXT,
    latitude                  DOUBLE PRECISION,
    longitude                 DOUBLE PRECISION,
    price                     DOUBLE PRECISION,
    "rentPerWeek"             DOUBLE PRECISION,
    "priceNegotiable"         BOOLEAN     NOT NULL DEFAULT false,
    bedrooms                  INTEGER     NOT NULL,
    bathrooms                 INTEGER     NOT NULL,
    "halfBathrooms"           INTEGER     NOT NULL DEFAULT 0,
    parking                   INTEGER     NOT NULL,
    "offStreetParking"        INTEGER,
    "ensuiteCount"            INTEGER     NOT NULL DEFAULT 0,
    "parkingDescription"      TEXT,
    "floorArea"               DOUBLE PRECISION,
    "landArea"                DOUBLE PRECISION,
    "agencyReference"         TEXT,
    "externalListingNumber"   TEXT,
    "viewCount"               INTEGER     NOT NULL DEFAULT 0,
    "totalUnits"              INTEGER,
    "soldUnits"               INTEGER,
    "remainingUnits"          INTEGER,
    "expectedCompletion"      TEXT,
    "builderName"             TEXT,
    "schoolZone"              TEXT,
    "warrantyInfo"            TEXT,
    "amenitiesNearby"         TEXT,
    "interiorHighlights"      TEXT,
    "layoutOptions"           TEXT,
    "openHomesNote"           TEXT,
    "agencyDisplayName"       TEXT,
    "agencyLicense"           TEXT,
    "officeBranchName"        TEXT,
    "officePhone"             TEXT,
    "officeWebsite"           TEXT,
    "appraisalUrl"            TEXT,
    "platinumPartner"         BOOLEAN     NOT NULL DEFAULT false,
    "listingAgentDisplayName" TEXT,
    "listingAgentPhotoUrl"    TEXT,
    "coListingAgentName"      TEXT,
    "coListingAgentPhotoUrl"  TEXT,
    "streetViewUrl"           TEXT,
    "googleMapsUrl"           TEXT,
    "videoUrl"                TEXT,
    features                  TEXT        NOT NULL,
    images                    TEXT        NOT NULL,
    "listedDate"              TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedDate"             TIMESTAMPTZ NOT NULL DEFAULT now(),
    "createdBy"               TEXT,
    notes                     TEXT
  )`,

  // ── listing_media ─────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS listing_media (
    id          TEXT    PRIMARY KEY,
    "listingId" TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    kind        TEXT    NOT NULL DEFAULT 'PHOTO',
    caption     TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
  )`,

  // ── listing_updates ───────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS listing_updates (
    id             TEXT        PRIMARY KEY,
    "listingId"    TEXT        NOT NULL,
    "authorUserId" TEXT,
    body           TEXT        NOT NULL,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  // ── listing_open_homes ────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS listing_open_homes (
    id          TEXT        PRIMARY KEY,
    "listingId" TEXT        NOT NULL,
    "startsAt"  TIMESTAMPTZ NOT NULL,
    "endsAt"    TIMESTAMPTZ,
    label       TEXT
  )`,

  // ── listing_documents ─────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS listing_documents (
    id          TEXT    PRIMARY KEY,
    "listingId" TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    url         TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
  )`,

  // ── enquiries ─────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS enquiries (
    id          TEXT        PRIMARY KEY,
    "listingId" TEXT        NOT NULL,
    name        TEXT        NOT NULL,
    email       TEXT        NOT NULL,
    phone       TEXT,
    message     TEXT        NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  // ── otps ──────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS otps (
    id             TEXT        PRIMARY KEY,
    "mobileNumber" TEXT        NOT NULL,
    code           TEXT        NOT NULL,
    "expiresAt"    TIMESTAMPTZ NOT NULL,
    verified       BOOLEAN     NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  // ── tradies ───────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS tradies (
    id               TEXT        PRIMARY KEY,
    slug             TEXT        NOT NULL UNIQUE,
    "businessName"   TEXT        NOT NULL,
    "contactName"    TEXT,
    categories       TEXT        NOT NULL DEFAULT '[]',
    skills           TEXT        NOT NULL DEFAULT '[]',
    description      TEXT,
    phone            TEXT        NOT NULL,
    "whatsappNumber" TEXT,
    email            TEXT,
    website          TEXT,
    "photoUrl"       TEXT,
    "licenseNumber"  TEXT,
    region           TEXT,
    district         TEXT,
    suburbs          TEXT        NOT NULL DEFAULT '[]',
    "isActive"       BOOLEAN     NOT NULL DEFAULT true,
    featured         BOOLEAN     NOT NULL DEFAULT false,
    "callClicks"     INTEGER     NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER     NOT NULL DEFAULT 0,
    "createdBy"      TEXT,
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];

for (const sql of statements) {
  const match = sql.match(/CREATE TABLE IF NOT EXISTS (\S+)/);
  const name = match?.[1] ?? '?';
  try {
    await client.query(sql);
    console.log(`✔  ${name}`);
  } catch (e) {
    console.error(`✘  ${name}: ${e.message}`);
    await client.end();
    process.exit(1);
  }
}

// Existing databases: add columns introduced after initial CREATE (idempotent).
// DSQL does not support ALTER TABLE ADD COLUMN ... NOT NULL / DEFAULT (constraint error).
// Use plain types here; optional UPDATE backfills booleans after add.
const userColumnAlters = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "officeBranchName" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "officePhone" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "officeWebsite" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "appraisalUrl" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "platinumPartner" BOOLEAN`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "listingAgentDisplayName" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "listingAgentPhotoUrl" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "coListingAgentName" TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS "coListingAgentPhotoUrl" TEXT`,
];
for (const sql of userColumnAlters) {
  try {
    await client.query(sql);
  } catch (e) {
    console.error(`✘  users alter: ${e.message}`);
    await client.end();
    process.exit(1);
  }
}
try {
  await client.query(`UPDATE users SET "platinumPartner" = false WHERE "platinumPartner" IS NULL`);
} catch (e) {
  console.warn(`⚠  users platinumPartner backfill skipped: ${e.message}`);
}
console.log('✔  users (branding column alters)');

// listings: add columns introduced after initial CREATE (idempotent)
const listingColumnAlters = [
  `ALTER TABLE listings ADD COLUMN IF NOT EXISTS "videoUrl" TEXT`,
];
for (const sql of listingColumnAlters) {
  try {
    await client.query(sql);
  } catch (e) {
    console.error(`✘  listings alter: ${e.message}`);
    await client.end();
    process.exit(1);
  }
}
console.log('✔  listings (videoUrl column alter)');

// enquiries: lead-source attribution (tracked links from social posts)
const enquiryColumnAlters = [
  `ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS "emailAudit" TEXT`,
  `ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS source TEXT`,
  `ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS "utmMedium" TEXT`,
  `ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT`,
  `ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS "campaignId" TEXT`,
  `ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS referrer TEXT`,
];
for (const sql of enquiryColumnAlters) {
  try {
    await client.query(sql);
  } catch (e) {
    console.error(`✘  enquiries alter: ${e.message}`);
    await client.end();
    process.exit(1);
  }
}
console.log('✔  enquiries (lead source column alters)');

await client.end();
console.log('\nAll tables created. Next step: npm run db:indexes:dsql');
