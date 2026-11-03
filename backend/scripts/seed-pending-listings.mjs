/**
 * Seed a few PENDING_APPROVAL listings on the current DB (dev by default).
 * Usage (from backend/):
 *   set -a; source .env; set +a
 *   node scripts/seed-pending-listings.mjs
 */
import { randomUUID } from 'crypto';
import { DsqlSigner } from '@aws-sdk/dsql-signer';
import pg from 'pg';

const host = process.env.AURORA_DSQL_HOST;
if (!host) {
  console.error('AURORA_DSQL_HOST not set. Source backend/.env first.');
  process.exit(1);
}

const region = process.env.AURORA_DSQL_REGION || process.env.AWS_REGION || 'ap-southeast-2';
const signer = new DsqlSigner({ hostname: host, region });
const token = await signer.getDbConnectAdminAuthToken();
const client = new pg.Client({
  host,
  user: 'admin',
  password: token,
  database: 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
console.log(`DB: ${host.slice(0, 12)}…`);

const agents = await client.query(
  `SELECT id, "firstName", "lastName", "mobileNumber", role
   FROM users
   WHERE role = 'AGENT' AND ("isActive" IS DISTINCT FROM false)
   ORDER BY "createdAt" ASC
   LIMIT 5`
);
let ownerId = agents.rows[0]?.id;
if (!ownerId) {
  const admins = await client.query(
    `SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`
  );
  ownerId = admins.rows[0]?.id;
}
if (!ownerId) {
  console.error('No agent or super admin user found.');
  await client.end();
  process.exit(1);
}

const agentLabel =
  [agents.rows[0]?.firstName, agents.rows[0]?.lastName].filter(Boolean).join(' ') ||
  agents.rows[0]?.mobileNumber ||
  ownerId;
console.log(`Owner: ${agentLabel} (${ownerId})`);

const samples = [
  {
    listingType: 'SALE',
    headline: '[TEST] Sunny 3-bed in Flat Bush — pending review',
    description:
      '<p>Dummy listing for admin review testing. Please approve or reject after smoke-testing the review queue.</p>',
    propertyType: 'HOUSE',
    region: 'Auckland',
    district: 'Manukau City',
    suburb: 'Flat Bush',
    streetAddress: '12 Test Road',
    city: 'Auckland',
    postalCode: '2019',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    price: 1250000,
    priceNegotiable: true,
  },
  {
    listingType: 'RENT',
    headline: '[TEST] Modern 2-bed apartment — pending review',
    description:
      '<p>Dummy rental for admin review testing. Bond and references ready scenario.</p>',
    propertyType: 'APARTMENT',
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Mount Eden',
    streetAddress: '45 Sample Street',
    city: 'Auckland',
    postalCode: '1024',
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    rentPerWeek: 620,
    priceNegotiable: false,
  },
  {
    listingType: 'SALE',
    headline: '[TEST] Family home near parks — pending review',
    description:
      '<p>Another dummy sale listing so the Pending badge shows a count greater than 1.</p>',
    propertyType: 'HOUSE',
    region: 'Waikato',
    district: 'Hamilton City',
    suburb: 'Hillcrest',
    streetAddress: '8 Demo Avenue',
    city: 'Hamilton',
    postalCode: '3216',
    bedrooms: 4,
    bathrooms: 2,
    parking: 2,
    price: 895000,
    priceNegotiable: false,
  },
];

const created = [];
for (const s of samples) {
  const id = randomUUID();
  const now = new Date().toISOString();
  await client.query(
    `INSERT INTO listings (
      id, "listingType", status, headline, description, "propertyType",
      region, district, suburb, "streetAddress", city, "postalCode",
      bedrooms, bathrooms, parking, price, "rentPerWeek", "priceNegotiable",
      images, features, "createdBy", "listedDate", "updatedDate", "viewCount", featured
    ) VALUES (
      $1, $2, 'PENDING_APPROVAL', $3, $4, $5,
      $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16, $17,
      '[]', '[]', $18, $19, $19, 0, false
    )`,
    [
      id,
      s.listingType,
      s.headline,
      s.description,
      s.propertyType,
      s.region,
      s.district,
      s.suburb,
      s.streetAddress,
      s.city,
      s.postalCode,
      s.bedrooms,
      s.bathrooms,
      s.parking,
      s.price ?? null,
      s.rentPerWeek ?? null,
      s.priceNegotiable,
      ownerId,
      now,
    ]
  );
  created.push({ id, headline: s.headline, listingType: s.listingType });
  console.log(`✔  ${s.listingType}  ${id}  ${s.headline}`);
}

const count = await client.query(
  `SELECT COUNT(*)::int AS n FROM listings WHERE status = 'PENDING_APPROVAL'`
);
console.log(`\nPending approval now: ${count.rows[0].n}`);
console.log('Open Admin → Listings (super admin) to review.');
await client.end();
