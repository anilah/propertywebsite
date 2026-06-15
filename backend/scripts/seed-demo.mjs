#!/usr/bin/env node
/**
 * Demo seed: 4 agents (2 with co-agents) + 20 NZ property listings.
 *
 * Idempotent — deletes previous seed data by fixed agent IDs, then re-inserts.
 *
 * Usage:
 *   AWS_PROFILE=customer-uat npm run db:seed
 */
import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(root, '.env') });

// ── DB connection (same pattern as other scripts) ─────────────────────────────
const host = process.env.AURORA_DSQL_HOST?.trim();
const region = process.env.AURORA_DSQL_REGION?.trim() || 'ap-southeast-2';
if (!host) { console.error('Set AURORA_DSQL_HOST in backend/.env'); process.exit(1); }

const token = execFileSync(
  'aws',
  ['dsql', 'generate-db-connect-admin-auth-token', '--expires-in', '900', '--region', region, '--hostname', host],
  { encoding: 'utf8' }
).trim();

const db = new pg.Client({
  host,
  port: 5432,
  database: process.env.AURORA_DSQL_DATABASE?.trim() || 'postgres',
  user: process.env.AURORA_DSQL_USER?.trim() || 'admin',
  password: token,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

// ── Helpers ───────────────────────────────────────────────────────────────────
const photos = (seeds) =>
  JSON.stringify(seeds.map((s) => `https://picsum.photos/seed/${s}/900/600`));

const feat = (...items) => JSON.stringify(items);

// ── 4 Agents (fixed IDs for idempotency) ─────────────────────────────────────
const AGENTS = [
  {
    id: 'seed-agent-0001-0000-0000-000000000001',
    mobileNumber: '02100000011',
    pin: '111111',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@raywhite.co.nz',
    agencyName: 'Ray White Remuera',
    licenseNumber: 'REAA-10024',
    profilePhotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    officeBranchName: 'Ray White Remuera',
    officePhone: '09 520 0000',
    officeWebsite: 'https://raywhite.co.nz',
    platinumPartner: true,
    listingAgentDisplayName: 'Sarah Mitchell',
    listingAgentPhotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    coListingAgentName: null,
    coListingAgentPhotoUrl: null,
  },
  {
    id: 'seed-agent-0002-0000-0000-000000000002',
    mobileNumber: '02100000012',
    pin: '222222',
    firstName: 'James',
    lastName: 'Taikato',
    email: 'james.taikato@barfoot.co.nz',
    agencyName: 'Barfoot & Thompson Mission Bay',
    licenseNumber: 'REAA-20851',
    profilePhotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    officeBranchName: 'Barfoot & Thompson Mission Bay',
    officePhone: '09 575 0000',
    officeWebsite: 'https://barfoot.co.nz',
    platinumPartner: true,
    listingAgentDisplayName: 'James Taikato',
    listingAgentPhotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    // Co-agent
    coListingAgentName: 'Lisa Chen',
    coListingAgentPhotoUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: 'seed-agent-0003-0000-0000-000000000003',
    mobileNumber: '02100000013',
    pin: '333333',
    firstName: 'Emma',
    lastName: 'Clarkson',
    email: 'emma.clarkson@harcourts.co.nz',
    agencyName: 'Harcourts City',
    licenseNumber: 'REAA-31274',
    profilePhotoUrl: 'https://randomuser.me/api/portraits/women/55.jpg',
    officeBranchName: 'Harcourts City',
    officePhone: '09 302 0000',
    officeWebsite: 'https://harcourts.co.nz',
    platinumPartner: false,
    listingAgentDisplayName: 'Emma Clarkson',
    listingAgentPhotoUrl: 'https://randomuser.me/api/portraits/women/55.jpg',
    // Co-agent
    coListingAgentName: 'Michael Brown',
    coListingAgentPhotoUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
  {
    id: 'seed-agent-0004-0000-0000-000000000004',
    mobileNumber: '02100000014',
    pin: '444444',
    firstName: 'David',
    lastName: 'Walsh',
    email: 'david.walsh@ljhooker.co.nz',
    agencyName: 'LJ Hooker Ponsonby',
    licenseNumber: 'REAA-40563',
    profilePhotoUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
    officeBranchName: 'LJ Hooker Ponsonby',
    officePhone: '09 376 0000',
    officeWebsite: 'https://ljhooker.co.nz',
    platinumPartner: false,
    listingAgentDisplayName: 'David Walsh',
    listingAgentPhotoUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
    coListingAgentName: null,
    coListingAgentPhotoUrl: null,
  },
];

// ── 20 Listings ───────────────────────────────────────────────────────────────
// agentIdx: 0–3 → maps to AGENTS array above
const LISTINGS = [
  // ── Sarah Mitchell (Ray White Remuera) — no co-agent ──────────────────────
  {
    agentIdx: 0,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8809, longitude: 174.7917,
    headline: 'Grand Family Residence With Harbour Views',
    description: `Nestled in the heart of Remuera, this magnificent five-bedroom home offers the ultimate in luxury living. Designed for families who love to entertain, the home features soaring ceilings, bespoke joinery, and seamless indoor-outdoor flow to a sun-drenched terrace overlooking the Waitemata Harbour. The gourmet kitchen is appointed with premium European appliances and stone benchtops. A separate self-contained suite is ideal for extended family or a home office. Double internally-accessed garaging completes the picture.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Remuera',
    streetAddress: '47 Arney Road',
    city: 'Auckland',
    price: 4250000,
    bedrooms: 5,
    bathrooms: 3,
    parking: 2,
    floorArea: 420,
    landArea: 850,
    features: feat('Double garage', 'Harbour views', 'Home theatre', 'Wine cellar', 'Heated pool', 'Under-floor heating', 'Smart home system', 'Guest suite'),
    images: photos(['rem1a','rem1b','rem1c','rem1d','rem1e']),
  },
  {
    agentIdx: 0,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8825, longitude: 174.7930,
    headline: 'Classic Remuera Villa — Meticulously Renovated',
    description: `This stunning 1920s villa has been thoughtfully renovated to marry period character with contemporary comfort. Original kauri floors, ornate fireplaces, and leadlight windows sit alongside a sleek new kitchen, spa-like bathrooms, and modern insulation throughout. Set on a private 720 sqm section with established gardens, mature pohutukawa, and off-street parking for three vehicles. Zoned for Remuera Intermediate and Selwyn College.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Remuera',
    streetAddress: '12 Victoria Avenue',
    city: 'Auckland',
    price: 2850000,
    bedrooms: 4,
    bathrooms: 2,
    parking: 2,
    floorArea: 280,
    landArea: 720,
    features: feat('Original kauri floors', 'Ornate fireplaces', 'Renovated kitchen', 'Private garden', 'Off-street parking', 'Double glazing'),
    images: photos(['rem2a','rem2b','rem2c','rem2d']),
  },
  {
    agentIdx: 0,
    listingType: 'SALE',
    propertyType: 'Townhouse',
    latitude: -36.8726, longitude: 174.7760,
    headline: 'Modern Townhouse — Lock-Up-and-Leave Luxury',
    description: `Brand new three-storey townhouse offering exceptional quality in one of Auckland's most sought-after addresses. Enjoy roof-top terrace views, a beautifully appointed open-plan living area, and a chef-inspired kitchen. Secure basement parking, video intercom, and fibre to the premises. A short walk to Newmarket's boutiques, cafés, and transport links makes this the ideal base for busy professionals.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Newmarket',
    streetAddress: '3/88 Broadway',
    city: 'Auckland',
    price: 1295000,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    floorArea: 195,
    features: feat('Rooftop terrace', 'Secure basement parking', 'Video intercom', 'Fibre internet', 'Heat pump', 'Double glazing'),
    images: photos(['nwm1a','nwm1b','nwm1c','nwm1d']),
  },
  {
    agentIdx: 0,
    listingType: 'RENT',
    propertyType: 'Apartment',
    latitude: -36.8740, longitude: 174.7775,
    headline: 'Stylish One-Bedroom in the Heart of Newmarket',
    description: `Contemporary apartment on the 8th floor with impressive city views. Features open-plan kitchen and living, premium appliances, and a private balcony. Building amenities include a gym, concierge, and secure car park. Walking distance to Newmarket train station and the best of Auckland's retail and dining.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Newmarket',
    streetAddress: '801/105 Khyber Pass Road',
    city: 'Auckland',
    rentPerWeek: 520,
    bedrooms: 1,
    bathrooms: 1,
    parking: 1,
    floorArea: 58,
    features: feat('City views', 'Gym access', 'Concierge', 'Secure parking', 'Balcony'),
    images: photos(['nwm2a','nwm2b','nwm2c']),
  },
  {
    agentIdx: 0,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.9012, longitude: 174.7740,
    headline: 'Epsom Family Home — Double Grammar Zone',
    description: `Perfectly positioned in Epsom's coveted Double Grammar Zone, this well-presented four-bedroom home is ideal for families seeking top-tier schooling. The spacious layout includes formal and informal living areas, a generous family kitchen, and a covered outdoor entertaining area overlooking the sunny back garden. A double garage plus off-street parking for guests completes the package.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Epsom',
    streetAddress: '54 Donald McLean Street',
    city: 'Auckland',
    price: 2100000,
    bedrooms: 4,
    bathrooms: 2,
    parking: 2,
    floorArea: 230,
    landArea: 610,
    features: feat('Double Grammar Zone', 'Double garage', 'Outdoor entertaining', 'Heat pump', 'Garden shed'),
    images: photos(['eps1a','eps1b','eps1c','eps1d']),
  },

  // ── James Taikato + Lisa Chen (Barfoot Mission Bay) — with co-agent ────────
  {
    agentIdx: 1,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8557, longitude: 174.8264,
    headline: 'Beachfront Entertainer — Mission Bay Masterpiece',
    description: `Rarely does a home of this calibre come to the market in Mission Bay. Directly opposite the beach, this architecturally designed home captures stunning 180-degree views of the Waitemata Harbour and Rangitoto Island. Three living zones, a home cinema, and a resort-style pool create the ultimate entertainer's paradise. The floor-to-ceiling glazing ensures every room is bathed in natural light and views. An oversized double garage and ample off-street parking complete this exceptional offering.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Mission Bay',
    streetAddress: '1 Tamaki Drive',
    city: 'Auckland',
    price: 5500000,
    bedrooms: 5,
    bathrooms: 4,
    parking: 3,
    floorArea: 520,
    landArea: 920,
    features: feat('Beachfront', 'Harbour views', 'Infinity pool', 'Home cinema', 'Wine cellar', 'Triple garage', 'Smart home', 'Rangitoto views'),
    images: photos(['mb1a','mb1b','mb1c','mb1d','mb1e']),
  },
  {
    agentIdx: 1,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8604, longitude: 174.8363,
    headline: 'Kohimarama Character Home — Walk to the Beach',
    description: `Charming four-bedroom bungalow set on a generous 650 sqm section just 200 metres from Kohimarama Beach. Recent updates include a new kitchen, modernised bathrooms, and a freshly landscaped garden. Enjoy indoor-outdoor living from the large decked area ideal for summer entertaining. Zoned for Kohimarama School and Selwyn College. All day sun and sea breezes make this a perfect family retreat.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Kohimarama',
    streetAddress: '28 Kohimarama Road',
    city: 'Auckland',
    price: 2650000,
    bedrooms: 4,
    bathrooms: 2,
    parking: 2,
    floorArea: 195,
    landArea: 650,
    features: feat('Walk to beach', 'Renovated kitchen', 'Large deck', 'All day sun', 'Sea breezes', 'Off-street parking'),
    images: photos(['koh1a','koh1b','koh1c','koh1d']),
  },
  {
    agentIdx: 1,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8665, longitude: 174.8495,
    headline: 'St Heliers — Elevated Coastal Views',
    description: `Perched above St Heliers with sweeping coastal views from every room, this architecturally designed home is a true sanctuary. The open-plan living and dining opens to a wraparound deck with unobstructed views of the harbour and islands beyond. Four bedrooms, a study, media room, and wine cellar cater to every need. The heated pool and spa complete this extraordinary coastal retreat.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'St Heliers',
    streetAddress: '9 Cliff Road',
    city: 'Auckland',
    price: 3750000,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    floorArea: 370,
    landArea: 780,
    features: feat('Coastal views', 'Heated pool & spa', 'Wine cellar', 'Study', 'Media room', 'Wraparound deck', 'Double garage'),
    images: photos(['sth1a','sth1b','sth1c','sth1d','sth1e']),
  },
  {
    agentIdx: 1,
    listingType: 'RENT',
    propertyType: 'House',
    latitude: -36.8570, longitude: 174.8280,
    headline: 'Spacious Family Home in Mission Bay — Available Now',
    description: `Light-filled four-bedroom family home just two streets from the beach. Open plan living and kitchen flows to a sunny patio and landscaped garden. Two bathrooms, a separate laundry, and a double garage. Pets considered on application. Close to excellent schools, cafés, and public transport.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Mission Bay',
    streetAddress: '14 Selwyn Avenue',
    city: 'Auckland',
    rentPerWeek: 1050,
    bedrooms: 4,
    bathrooms: 2,
    parking: 2,
    floorArea: 210,
    features: feat('Close to beach', 'Sunny patio', 'Double garage', 'Pets considered', 'Separate laundry'),
    images: photos(['mb2a','mb2b','mb2c']),
  },
  {
    agentIdx: 1,
    listingType: 'SALE',
    propertyType: 'Apartment',
    latitude: -36.8755, longitude: 174.7768,
    headline: 'Newmarket — Chic Two-Bedroom Apartment With Parking',
    description: `Beautifully presented two-bedroom apartment in a boutique complex moments from Newmarket's village precinct. Enjoy a sun-drenched north-facing balcony, generous open-plan living, and a modern kitchen with island bench. Secure carpark included. The building features a rooftop garden and communal BBQ area. An outstanding opportunity for owner-occupiers or investors.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Newmarket',
    streetAddress: '4/52 Gillies Avenue',
    city: 'Auckland',
    price: 875000,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    floorArea: 82,
    features: feat('North-facing balcony', 'Secure parking', 'Rooftop garden', 'Communal BBQ', 'Island bench'),
    images: photos(['nwm3a','nwm3b','nwm3c']),
  },

  // ── Emma Clarkson + Michael Brown (Harcourts City) — with co-agent ─────────
  {
    agentIdx: 2,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8594, longitude: 174.7440,
    headline: 'Ponsonby Villa — Original Character Meets Modern Style',
    description: `A beautifully preserved 1910 villa offering four bedrooms, formal and informal living areas, and a wonderfully private rear garden. The sympathetically renovated kitchen and bathrooms retain original detailing while introducing modern comforts. Polished rimu floors, working fireplaces, original plasterwork, and bay windows tell the story of a hundred years of Auckland history. Garaging for one vehicle plus additional off-street parking. Just a short stroll to Ponsonby Road, SILO Park, and the CBD.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Ponsonby',
    streetAddress: '62 Franklin Road',
    city: 'Auckland',
    price: 2400000,
    bedrooms: 4,
    bathrooms: 2,
    parking: 1,
    floorArea: 220,
    landArea: 480,
    features: feat('Polished rimu floors', 'Working fireplaces', 'Private garden', 'Original plasterwork', 'Bay windows', 'Renovated bathrooms'),
    images: photos(['pon1a','pon1b','pon1c','pon1d']),
  },
  {
    agentIdx: 2,
    listingType: 'SALE',
    propertyType: 'Townhouse',
    latitude: -36.8681, longitude: 174.7362,
    headline: 'Grey Lynn — Contemporary Townhouse, No Body Corp',
    description: `Freehold two-level townhouse in a boutique development of just six. Designed for low-maintenance living without sacrificing style, the home features engineered oak flooring, high ceilings, and a seamless flow from the open-plan kitchen to a private courtyard garden. Master bedroom with ensuite and walk-in wardrobe upstairs. Internal garage plus additional off-street parking. Walk to Grey Lynn Park, the Saturday markets, and the best of Ponsonby Road.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Grey Lynn',
    streetAddress: '3/14 Surrey Crescent',
    city: 'Auckland',
    price: 1450000,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    floorArea: 165,
    features: feat('Freehold', 'No body corporate', 'Courtyard garden', 'Engineered oak flooring', 'Walk-in wardrobe', 'Internal garage'),
    images: photos(['grl1a','grl1b','grl1c','grl1d']),
  },
  {
    agentIdx: 2,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8839, longitude: 174.7555,
    headline: 'Mt Eden Character Bungalow — Walk to the Village',
    description: `Quintessential Auckland bungalow in a prime Mt Eden location. Lovingly maintained and updated over the years, the home boasts polished timber floors, a renovated kitchen, and a landscaped garden with raised vegetable beds and a productive lemon tree. An enormous north-facing deck is perfect for summer entertaining. Walk to Mt Eden Village, top schools, and Kingsland train station. An exceptional lifestyle opportunity.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Mt Eden',
    streetAddress: '11 Normanby Road',
    city: 'Auckland',
    price: 1780000,
    bedrooms: 3,
    bathrooms: 1,
    parking: 1,
    floorArea: 150,
    landArea: 560,
    features: feat('North-facing deck', 'Polished floors', 'Renovated kitchen', 'Raised garden beds', 'Walk to village', 'Character features'),
    images: photos(['mte1a','mte1b','mte1c','mte1d']),
  },
  {
    agentIdx: 2,
    listingType: 'RENT',
    propertyType: 'House',
    latitude: -36.8695, longitude: 174.7375,
    headline: 'Grey Lynn — Sunny 3-Bed, Great Outdoor Space',
    description: `Charming three-bedroom home with a large sunny deck and spacious backyard in sought-after Grey Lynn. Recently refreshed with new paint and carpet throughout. Open plan kitchen and living with a heat pump. Off-street parking for two vehicles. Close to excellent schools, parks, and the vibrant café and restaurant strip. Pets on application.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Grey Lynn',
    streetAddress: '78 Williamson Avenue',
    city: 'Auckland',
    rentPerWeek: 720,
    bedrooms: 3,
    bathrooms: 1,
    parking: 2,
    floorArea: 140,
    features: feat('Large deck', 'Spacious backyard', 'Heat pump', 'Off-street parking', 'Recently refreshed', 'Pets on application'),
    images: photos(['grl2a','grl2b','grl2c']),
  },
  {
    agentIdx: 2,
    listingType: 'SALE',
    propertyType: 'Apartment',
    latitude: -36.8585, longitude: 174.7762,
    headline: 'Parnell Heritage Apartment — Unique Boutique Building',
    description: `One of Parnell's most unique offerings — a generously proportioned two-bedroom apartment housed in a converted 1920s wool store. Soaring 3.8m ceilings, exposed brick, steel beams, and original timber floors celebrate the building's industrial heritage. A beautifully fitted kitchen, two full bathrooms, and a large private balcony overlooking the Parnell Rose Gardens complete the picture. Secure basement parking and private storage included.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Parnell',
    streetAddress: '14/2 St Georges Bay Road',
    city: 'Auckland',
    price: 1150000,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    floorArea: 118,
    features: feat('3.8m stud ceilings', 'Exposed brick', 'Original timber floors', 'Private balcony', 'Secure parking', 'Storage unit'),
    images: photos(['par1a','par1b','par1c','par1d']),
  },

  // ── David Walsh (LJ Hooker Ponsonby) — no co-agent ────────────────────────
  {
    agentIdx: 3,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.7859, longitude: 174.7747,
    headline: 'Takapuna — Premium Beachside Living',
    description: `This stunning four-bedroom home is set just 80 metres from Takapuna Beach, Auckland's most popular urban beach. Spread across two generous levels, the home features an open-plan ground floor with indoor-outdoor flow to a north-facing deck, a bespoke kitchen with Miele appliances, and a master suite with harbour views. An oversized double garage, solar panels, and an EV charger make this a future-proof investment. Walk to Takapuna's vibrant café strip, restaurants, and the weekly market.`,
    region: 'Auckland',
    district: 'North Shore City',
    suburb: 'Takapuna',
    streetAddress: '15 Hurstmere Road',
    city: 'Auckland',
    price: 3850000,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    floorArea: 320,
    landArea: 540,
    features: feat('80m to beach', 'Miele appliances', 'Solar panels', 'EV charger', 'North-facing deck', 'Double garage', 'Harbour views'),
    images: photos(['tak1a','tak1b','tak1c','tak1d','tak1e']),
  },
  {
    agentIdx: 3,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8284, longitude: 174.8010,
    headline: 'Devonport — Heritage Home in the Village',
    description: `Step back in time with this enchanting Edwardian villa situated in the heart of Devonport village. Three generous bedrooms, a formal lounge with original fireplace, and a light-filled family kitchen looking out to a beautifully maintained garden. The wide front verandah is the perfect spot to enjoy an afternoon sea breeze. A short walk to the ferry, Devonport village shops, cafés, and the naval base. A rare opportunity to own a piece of Auckland's historic waterfront suburb.`,
    region: 'Auckland',
    district: 'North Shore City',
    suburb: 'Devonport',
    streetAddress: '7 Church Street',
    city: 'Auckland',
    price: 1950000,
    bedrooms: 3,
    bathrooms: 1,
    parking: 1,
    floorArea: 165,
    landArea: 520,
    features: feat('Edwardian villa', 'Original fireplace', 'Front verandah', 'Walk to ferry', 'Heritage features', 'Established garden'),
    images: photos(['dev1a','dev1b','dev1c','dev1d']),
  },
  {
    agentIdx: 3,
    listingType: 'SALE',
    propertyType: 'Lifestyle',
    latitude: -36.8090, longitude: 175.1089,
    headline: 'Waiheke Island — Vineyard Lifestyle Property',
    description: `An extraordinary opportunity to own 4.2 hectares of prime Waiheke Island land featuring an established boutique vineyard, a fully renovated four-bedroom homestead, a two-bedroom cottage, cellar door, and multiple outbuildings. The homestead offers stunning Hauraki Gulf views from every room. Swim in the infinity pool, harvest your own grapes, or simply soak up the island lifestyle. Just 35 minutes by ferry from downtown Auckland.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Waiheke Island',
    streetAddress: '142 Onetangi Road',
    city: 'Auckland',
    price: 4800000,
    bedrooms: 6,
    bathrooms: 4,
    parking: 4,
    floorArea: 480,
    landArea: 42000,
    features: feat('Boutique vineyard', 'Infinity pool', 'Gulf views', 'Cellar door', 'Guest cottage', 'Outbuildings', '4.2 ha land'),
    images: photos(['wai1a','wai1b','wai1c','wai1d','wai1e']),
  },
  {
    agentIdx: 3,
    listingType: 'RENT',
    propertyType: 'Apartment',
    latitude: -36.7872, longitude: 174.7760,
    headline: 'Takapuna — Modern 2-Bed, Steps to the Beach',
    description: `Light-filled two-bedroom apartment with a spacious balcony and peekaboo sea views in a contemporary Takapuna building. Features open-plan living and dining, a fully equipped kitchen, heat pump, and in-unit laundry. One secure car park included. Building has a residents' gym and communal rooftop lounge. Available immediately.`,
    region: 'Auckland',
    district: 'North Shore City',
    suburb: 'Takapuna',
    streetAddress: '302/22 The Strand',
    city: 'Auckland',
    rentPerWeek: 680,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    floorArea: 79,
    features: feat('Sea views', 'Balcony', 'Gym access', 'Rooftop lounge', 'In-unit laundry', 'Secure parking'),
    images: photos(['tak2a','tak2b','tak2c']),
  },
  {
    agentIdx: 3,
    listingType: 'SALE',
    propertyType: 'House',
    latitude: -36.8896, longitude: 174.7291,
    headline: 'Sandringham — Character Bungalow, Huge Potential',
    description: `An outstanding entry-level opportunity in rapidly gentrifying Sandringham. This classic 1940s bungalow sits on a large 620 sqm section with north-facing rear aspect. The home has been freshly painted throughout and offers three bedrooms, a tidy kitchen, separate lounge, and a sunny back deck. With its generous land size and central location, this is a superb project for a renovator, investor, or first-home buyer. A short walk to Sandringham Road cafés and Wesley Primary School.`,
    region: 'Auckland',
    district: 'Auckland City',
    suburb: 'Sandringham',
    streetAddress: '35 Asquith Avenue',
    city: 'Auckland',
    price: 1080000,
    bedrooms: 3,
    bathrooms: 1,
    parking: 1,
    floorArea: 120,
    landArea: 620,
    features: feat('Large section', 'North-facing', 'Renovation potential', 'Freshly painted', 'Off-street parking', 'Good school zone'),
    images: photos(['san1a','san1b','san1c']),
  },
];

// ── Run seed ──────────────────────────────────────────────────────────────────
console.log('\n🌱  PropertyReach Demo Seed\n');

// 1. Clear previous seed listings (delete by known agent IDs)
const agentIds = AGENTS.map((a) => a.id);
console.log('🗑   Clearing previous seed data…');

// Delete child records first (DSQL has no DB-level cascade)
for (const table of ['listing_media', 'listing_updates', 'listing_open_homes', 'listing_documents', 'enquiries']) {
  await db.query(
    `DELETE FROM ${table} WHERE "listingId" IN (SELECT id FROM listings WHERE "createdBy" = ANY($1))`,
    [agentIds]
  );
}
await db.query(`DELETE FROM listings WHERE "createdBy" = ANY($1)`, [agentIds]);
await db.query(`DELETE FROM users WHERE id = ANY($1)`, [agentIds]);
console.log('   ✔  Old seed records removed.\n');

// 2. Insert agents
console.log('👤  Inserting agents…');
for (const a of AGENTS) {
  await db.query(
    `INSERT INTO users (
      id, "mobileNumber", role, pin, "isActive",
      "firstName", "lastName", email,
      "agencyName", "licenseNumber", "profilePhotoUrl",
      "officeBranchName", "officePhone", "officeWebsite", "appraisalUrl",
      "platinumPartner",
      "listingAgentDisplayName", "listingAgentPhotoUrl",
      "coListingAgentName", "coListingAgentPhotoUrl",
      "createdAt", "updatedAt"
    ) VALUES (
      $1,$2,'AGENT',$3,true,
      $4,$5,$6,
      $7,$8,$9,
      $10,$11,$12,null,
      $13,
      $14,$15,
      $16,$17,
      now(),now()
    )`,
    [
      a.id, a.mobileNumber, a.pin,
      a.firstName, a.lastName, a.email,
      a.agencyName, a.licenseNumber, a.profilePhotoUrl,
      a.officeBranchName, a.officePhone, a.officeWebsite,
      a.platinumPartner,
      a.listingAgentDisplayName, a.listingAgentPhotoUrl,
      a.coListingAgentName || null, a.coListingAgentPhotoUrl || null,
    ]
  );
  const coTag = a.coListingAgentName ? ` + ${a.coListingAgentName}` : '';
  console.log(`   ✔  ${a.firstName} ${a.lastName}${coTag} (${a.agencyName}) — PIN ${a.pin}`);
}

// 3. Insert listings
console.log('\n🏠  Inserting listings…');
let saleCount = 0, rentCount = 0;
for (const l of LISTINGS) {
  const agent = AGENTS[l.agentIdx];
  const id = randomUUID();
  await db.query(
    `INSERT INTO listings (
      id, "listingType", status, headline, description,
      "propertyType", region, district, suburb, "streetAddress", city,
      latitude, longitude,
      price, "rentPerWeek", "priceNegotiable",
      bedrooms, bathrooms, parking,
      "floorArea", "landArea",
      features, images,
      "platinumPartner",
      "createdBy",
      "listedDate", "updatedDate"
    ) VALUES (
      $1,$2,'PUBLISHED',$3,$4,
      $5,$6,$7,$8,$9,$10,
      $11,$12,
      $13,$14,false,
      $15,$16,$17,
      $18,$19,
      $20,$21,
      $22,
      $23,
      now(),now()
    )`,
    [
      id, l.listingType, l.headline, l.description,
      l.propertyType, l.region, l.district, l.suburb, l.streetAddress || null, l.city || null,
      l.latitude || null, l.longitude || null,
      l.price || null, l.rentPerWeek || null,
      l.bedrooms, l.bathrooms, l.parking,
      l.floorArea || null, l.landArea || null,
      l.features, l.images,
      agent.platinumPartner,
      agent.id,
    ]
  );
  if (l.listingType === 'SALE') saleCount++; else rentCount++;
  const price = l.price ? `$${(l.price/1e6).toFixed(2)}M` : `$${l.rentPerWeek}/wk`;
  console.log(`   ✔  [${l.listingType}] ${l.suburb} — ${l.headline.substring(0,45)}… (${price})`);
}

await db.end();

console.log(`
✅  Seed complete!
    Agents  : ${AGENTS.length} (${AGENTS.filter(a=>a.coListingAgentName).length} with co-agents)
    Listings: ${LISTINGS.length} (${saleCount} for sale · ${rentCount} for rent)

Agent logins (mobile → PIN):
${ AGENTS.map(a=>`    ${a.mobileNumber}  →  ${a.pin}  (${a.firstName} ${a.lastName})`).join('\n') }
`);
