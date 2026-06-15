export interface NewsArticle {
  id: number;
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
  body: string[];
  featured?: boolean;
}

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    slug: "arrowtown-most-expensive-postcode",
    category: "Property Pulse Report",
    title: "Arrowtown crowned Aotearoa's most expensive postcode",
    description: "Property Pulse Report - March 2026",
    date: "15 April 2026",
    readTime: "4 min read",
    image: "https://picsum.photos/seed/arrowtown/900/500",
    featured: true,
    body: [
      "Arrowtown has overtaken Herne Bay to claim the title of New Zealand's most expensive postcode, with a median sale price of $3.42 million in the March 2026 quarter.",
      "The Otago alpine village's rise reflects a broader trend of high-end buyers gravitating toward lifestyle locations over traditional metro suburbs. Limited stock and tight zoning rules have squeezed supply, while a steady stream of international and Auckland-based buyers continues to underpin demand.",
      "Cotality (formerly CoreLogic) head of research Nick Goodall said the result was striking but not unexpected. \"Arrowtown has long been on the threshold. What's changed in the past six months is the depth of buyer pool — there are simply more cash-ready buyers chasing a fixed number of homes.\"",
      "Other notable postcodes in the top 10 included Herne Bay (Auckland), Queenstown's Kelvin Heights, and Wellington's Roseneath.",
    ],
  },
  {
    id: 2,
    slug: "kaipara-bay-seaside-villa",
    category: "Explore",
    title: "Seaside villa sees all, from dolphins and penguins to passing ships",
    description: "Historic Kaipara Bay villa offers front-row beach panoramas and a rare connection to coastal wildlife.",
    date: "20 April 2026",
    readTime: "3 min read",
    image: "https://picsum.photos/seed/seaside-villa/600/400",
    body: [
      "Perched above the dunes at Kaipara Bay, this restored 1920s villa offers something rare even by Northland's standards — uninterrupted ocean panoramas that stretch from the harbour mouth to the open Tasman.",
      "Owners Sarah and Matt Holloway bought the property in 2019 and have spent the past five years sensitively restoring its original features while modernising the kitchen, bathrooms, and insulation.",
      "\"On a still morning you can hear the dolphins before you see them,\" Sarah said. \"Little blue penguins nest under the deck in spring, and the kids count container ships heading for the Port of Auckland.\"",
    ],
  },
  {
    id: 3,
    slug: "waiheke-celebrity-getaway",
    category: "Feature article",
    title: "What Stars Really Want From a Waiheke Getaway",
    description: "Luxury escapes on Waiheke Island are drawing high-profile buyers seeking privacy and ocean views.",
    date: "20 April 2026",
    readTime: "3 min read",
    image: "https://picsum.photos/seed/waiheke/600/400",
    body: [
      "Waiheke Island has long been a playground for Auckland's wealthy, but a new wave of international buyers is reshaping the upper end of the market.",
      "Premium agents report a sharp rise in enquiries from Hollywood actors, tech founders, and Australian executives looking for waterfront holiday homes with helicopter access and uncompromised privacy.",
      "Listings above $10 million are now appearing regularly on the island, with several recent sales agreed off-market to maintain confidentiality.",
    ],
  },
  {
    id: 4,
    slug: "aw-architects-canterbury-home",
    category: "Explore",
    title: "For Andrew Watson of Christchurch's AW Architects, this house was meant to be",
    description: "A visionary architect finds his forever home in a Canterbury heritage property with modern soul.",
    date: "17 April 2026",
    readTime: "3 min read",
    image: "https://picsum.photos/seed/christchurch-arch/600/400",
    body: [
      "When Andrew Watson stepped through the wrought-iron gates of a forgotten Edwardian villa in Fendalton, he knew immediately it would become his family's home.",
      "Two years and a meticulous restoration later, the property is a study in how to honour heritage while creating a deeply modern living experience.",
      "\"The bones were extraordinary,\" Watson said. \"Our job was to remove the bad decisions of the last eighty years and let the original house breathe again.\"",
    ],
  },
  {
    id: 5,
    slug: "auckland-prices-over-million",
    category: "Market news",
    title: "Auckland prices back over million-dollar mark",
    description: "The Auckland median house price has climbed back above $1m for the first time since late 2024.",
    date: "14 April 2026",
    readTime: "5 min read",
    image: "https://picsum.photos/seed/auckland-prices/600/400",
    body: [
      "Auckland's median house price returned to seven figures in March 2026, hitting $1.02 million according to the latest REINZ data.",
      "The result represents a 6.3% lift on the same time last year and confirms what agents have been reporting on the ground — strong attendance at open homes, more multiple-offer scenarios, and a noticeable lift in first-home buyer activity.",
      "Lower interest rates, easing CCCFA constraints, and rising wages have combined to bring buyers back to the market. However, supply remains tight, with new listings down 8% year-on-year.",
      "Economists are split on whether the recovery will continue at this pace through winter, with some warning that affordability constraints remain a meaningful headwind.",
    ],
  },
  {
    id: 6,
    slug: "ocr-remains-at-2-25",
    category: "Market news",
    title: "OCR remains at 2.25% — what it means for mortgage holders",
    description: "The Reserve Bank holds the Official Cash Rate steady. Chief Economist Kelvin Davidson explains the implications.",
    date: "12 April 2026",
    readTime: "4 min read",
    image: "https://picsum.photos/seed/ocr-rate/600/400",
    body: [
      "The Reserve Bank of New Zealand has held the Official Cash Rate at 2.25% for the second consecutive meeting, citing balanced inflation risks and a steady labour market.",
      "For mortgage holders, the decision is broadly neutral. Floating rates are unlikely to move materially in either direction, while fixed rates will continue to reflect wholesale market expectations of where the OCR heads next.",
      "Chief Economist Kelvin Davidson noted that the market is already pricing in another 25 basis point cut by August, with banks competing aggressively for new lending in the meantime.",
    ],
  },
  {
    id: 7,
    slug: "first-home-buyers-return",
    category: "Buying & selling",
    title: "First-home buyers return as affordability improves",
    description: "Rising wages and lower interest rates are bringing first-home buyers back to the market across New Zealand.",
    date: "10 April 2026",
    readTime: "4 min read",
    image: "https://picsum.photos/seed/first-home/600/400",
    body: [
      "First-home buyers accounted for 27% of all property purchases in March 2026, the highest share recorded since 2018.",
      "The shift reflects a combination of factors: house prices that have moderated from their 2021 peak, mortgage rates back in the 5% range, and a recent lift in KiwiSaver first-home withdrawal limits.",
      "Agents report that first-home buyers are now competing seriously for entry-level properties in Auckland, Christchurch, and Hamilton, with multi-offer scenarios increasingly common.",
    ],
  },
  {
    id: 8,
    slug: "wellington-demand-grows",
    category: "Market news",
    title: "Wellington housing demand continues to grow",
    description: "Regional market insights show Wellington demand outpacing supply for the third consecutive quarter.",
    date: "9 April 2026",
    readTime: "3 min read",
    image: "https://picsum.photos/seed/wellington-demand/600/400",
    body: [
      "Wellington's housing market is showing its strongest momentum since 2021, with the capital's median sale price up 4.8% year-on-year.",
      "Public service hiring, returning migration, and a tight rental market are all driving demand. Listing volumes remain well below the long-run average.",
      "The Hutt Valley and Porirua have led the gains, with several suburbs now setting fresh price records.",
    ],
  },
  {
    id: 9,
    slug: "renovation-trends-2026",
    category: "Home and living",
    title: "The renovation trends shaping New Zealand homes in 2026",
    description: "From backyard studios to open-plan living, here are the upgrades Kiwis are investing in most.",
    date: "7 April 2026",
    readTime: "5 min read",
    image: "https://picsum.photos/seed/renovation-trends/600/400",
    body: [
      "Backyard studios, kitchen overhauls, and ground-source heat pumps top the list of renovation investments New Zealanders are making in 2026.",
      "Architects report a clear shift toward flexible living — homes that can accommodate working from home, multi-generational living, and ageing in place without major future modification.",
      "Sustainability is also driving spend, with solar panels, batteries, and high-performance insulation moving from optional to expected on mid-market projects.",
    ],
  },
  {
    id: 10,
    slug: "queenstown-lake-retreat",
    category: "Explore",
    title: "Inside one of Queenstown's most jaw-dropping lake-view retreats",
    description: "This architect-designed home perches above Lake Wakatipu with floor-to-ceiling glass and alpine views.",
    date: "5 April 2026",
    readTime: "3 min read",
    image: "https://picsum.photos/seed/queenstown-lake/600/400",
    body: [
      "Set high above Lake Wakatipu's southern shore, this architect-designed retreat is a masterclass in framing one of New Zealand's most photographed landscapes.",
      "Floor-to-ceiling glass on three sides captures the lake, the Remarkables range, and Cecil Peak, while a central stone fireplace anchors the open-plan living space.",
      "Five bedrooms, a private wine cellar, and a heated lap pool round out a home built for both entertaining and quiet retreat.",
    ],
  },
  {
    id: 11,
    slug: "how-to-negotiate-better-price",
    category: "Buying & selling",
    title: "How to negotiate your way to a better price in today's market",
    description: "Expert tips for buyers looking to secure a deal in a market where sellers are still holding firm.",
    date: "3 April 2026",
    readTime: "6 min read",
    image: "https://picsum.photos/seed/negotiate-price/600/400",
    body: [
      "Negotiating well starts long before the offer is written. Buyers who understand the seller's situation, the property's history, and the recent comparable sales in the suburb have a meaningful edge.",
      "Top buyers' agents recommend a clear pre-set walk-away price, an inspection schedule that gives you optionality, and an opening offer that leaves room to move without insulting the seller.",
      "Above all, build rapport. In a tight market, the buyer the agent likes and trusts will often win against a slightly higher offer.",
    ],
  },
  {
    id: 12,
    slug: "rental-yields-comparison",
    category: "Market research",
    title: "Rental yields across New Zealand — a city-by-city comparison",
    description: "Investors crunching numbers will want to read our breakdown of gross rental yields in every major centre.",
    date: "1 April 2026",
    readTime: "5 min read",
    image: "https://picsum.photos/seed/rental-yields/600/400",
    body: [
      "Gross rental yields range from a low of 3.1% in central Auckland to a high of 6.8% in parts of Invercargill, according to fresh data covering Q1 2026.",
      "Investors increasingly look beyond the headline yield to consider tenant demand, vacancy risk, and the trajectory of capital values. High-yield markets often come with lower capital growth, and vice versa.",
      "Christchurch and Hamilton continue to offer the most balanced combination of yield and growth, while Dunedin's student-heavy rental pool keeps yields well above the metropolitan average.",
    ],
  },
];

export function getArticleById(id: number): NewsArticle | undefined {
  return newsArticles.find((a) => a.id === id);
}
