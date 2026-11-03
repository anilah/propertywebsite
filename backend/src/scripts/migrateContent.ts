/**
 * One-time migration: create content_posts table + seed default guides.
 * Run with: npx ts-node src/scripts/migrateContent.ts
 * Or after build: node dist/scripts/migrateContent.js
 */
import { applyDsqlIamDatabaseUrl } from '../config/dsqlDatabaseUrl.js';

async function run() {
  // Generate IAM token and set DATABASE_URL for DSQL
  console.log('▶  Generating DSQL IAM token...');
  await applyDsqlIamDatabaseUrl();
  console.log('✅  DATABASE_URL set');

  // Import prisma AFTER DATABASE_URL is set
  const { default: prisma } = await import('../config/database.js');

  // Create table
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS content_posts (
        id TEXT NOT NULL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        body JSONB NOT NULL,
        image_url TEXT,
        category TEXT,
        featured BOOLEAN NOT NULL DEFAULT false,
        published BOOLEAN NOT NULL DEFAULT true,
        read_time TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT
      )
    `);
    console.log('✅  content_posts table ready');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('already exists')) {
      console.log('   Table already exists — skipping CREATE');
    } else {
      throw e;
    }
  }

  // Create indexes (ASYNC for DSQL compatibility)
  for (const sql of [
    'CREATE INDEX ASYNC IF NOT EXISTS content_posts_type_pub ON content_posts(type, published)',
    'CREATE INDEX ASYNC IF NOT EXISTS content_posts_slug_idx ON content_posts(slug)',
  ]) {
    try { await prisma.$executeRawUnsafe(sql); }
    catch { /* index may already exist */ }
  }
  console.log('✅  Indexes ready');

  // Seed default guides
  const guides = [
    {
      id: 'guide_buying_house',
      slug: 'guide-to-buying-a-house',
      title: 'Guide to buying a house',
      excerpt: 'Tips for every part of your home buying journey.',
      category: 'Buying',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
      sortOrder: 1,
      body: { sections: [
        { heading: 'Getting started', body: [
          'Buying your first home is one of the biggest financial decisions you will make. Start by getting your finances in order — talk to a mortgage adviser to understand how much you can borrow.',
          'Save for a deposit. Most lenders in New Zealand require at least 20% for an investment property or 10% for a first home. Consider KiwiSaver first-home withdrawal options.',
        ]},
        { heading: 'Finding the right property', body: [
          'Research neighbourhoods that suit your lifestyle and budget. Attend open homes to get a feel for the market.',
          'Once you find a property, get a building inspection done before making an offer. It can save you thousands in unexpected repair costs.',
        ]},
        { heading: 'Making an offer', body: [
          'Work with a lawyer (conveyancer) to review sale and purchase agreements. Understand conditions such as finance approval and building report.',
          'Negotiate on price, settlement date and any chattels included in the sale.',
        ]},
        { heading: 'Settlement day', body: [
          'On settlement day your lawyer will handle the transfer of funds and ownership. You will receive the keys once everything is confirmed.',
          'Congratulations — you are now a homeowner!',
        ]},
      ]},
    },
    {
      id: 'guide_selling_tips',
      slug: 'selling-tips-and-advice',
      title: 'Selling tips and advice',
      excerpt: 'Get the most out of selling your biggest asset.',
      category: 'Selling',
      imageUrl: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
      sortOrder: 2,
      body: { sections: [
        { heading: 'Preparing your home', body: [
          'First impressions count. Declutter, clean, and attend to minor repairs before listing. Fresh paint and tidy gardens can significantly increase buyer appeal.',
          'Consider a pre-sale building inspection to identify issues before buyers do — it demonstrates transparency and confidence.',
        ]},
        { heading: 'Pricing your property', body: [
          'Work with your agent to set a realistic asking price based on comparable sales in your area. Overpricing can lead to your listing sitting on the market.',
          'Review recent sales data and get multiple appraisals if needed.',
        ]},
        { heading: 'Marketing your listing', body: [
          'Professional photography is essential. High-quality images and virtual tours attract significantly more interest online.',
          'Use a mix of channels: real estate websites, social media and open homes.',
        ]},
        { heading: 'Negotiating and settling', body: [
          'Review all offers carefully with your agent. Consider not just the price but also conditions and settlement dates.',
          'Once a sale is unconditional, work with your lawyer to ensure a smooth settlement.',
        ]},
      ]},
    },
    {
      id: 'guide_local_area',
      slug: 'understand-your-local-area',
      title: 'Understand your local area',
      excerpt: 'Find property estimates, sold prices, rateable values, and more.',
      category: 'Research',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
      sortOrder: 3,
      body: { sections: [
        { heading: 'Rateable values (RV)', body: [
          'Rateable values are set by councils every three years and are used to calculate rates. They are not the same as market value.',
          'While RV can give a rough benchmark, actual sale prices can vary significantly depending on market conditions.',
        ]},
        { heading: 'Recent sales data', body: [
          'Looking at recent comparable sales (comps) in your target area is the most reliable way to gauge current market value.',
          'Filter by property type, size and bedrooms to find the most relevant comparisons.',
        ]},
        { heading: 'School zones and amenities', body: [
          'Proximity to schools, public transport, shops and parks can significantly affect property values.',
          'Always check official school zone boundaries directly with the Ministry of Education as these can change.',
        ]},
      ]},
    },
    {
      id: 'guide_track_home_value',
      slug: 'track-your-homes-value',
      title: "Track your home's value",
      excerpt: 'Get updates when your property estimate is refreshed.',
      category: 'Property value',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      sortOrder: 4,
      body: { sections: [
        { heading: 'What is a property estimate?', body: [
          'A property estimate is an automated valuation of your property based on recent sales, property attributes and market trends.',
          'It is a useful indicator but is not a substitute for a registered valuation when buying or selling.',
        ]},
        { heading: 'How to use it', body: [
          'Track how your estimated value changes over time and compare it with others in your suburb.',
          'Use it when refinancing to understand your potential equity position, or when planning renovations to estimate uplift.',
        ]},
      ]},
    },
  ];

  let seeded = 0;
  for (const g of guides) {
    const existing = await prisma.contentPost.findUnique({ where: { slug: g.slug } });
    if (!existing) {
      await prisma.contentPost.create({
        data: {
          id: g.id,
          slug: g.slug,
          type: 'guide',
          title: g.title,
          excerpt: g.excerpt,
          body: g.body,
          imageUrl: g.imageUrl,
          category: g.category,
          featured: false,
          published: true,
          sortOrder: g.sortOrder,
        },
      });
      seeded++;
      console.log('  ✅  Seeded:', g.title);
    } else {
      console.log('  ⏭   Already exists:', g.slug);
    }
  }
  console.log(`\n✅  Migration complete. Seeded ${seeded} guide(s).`);
  await prisma.$disconnect();
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });
