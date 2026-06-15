import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface Guide {
  slug: string;
  title: string;
  intro: string;
  image: string;
  sections: { heading: string; body: string[] }[];
}

const guides: Guide[] = [
  {
    slug: "track-home-value",
    title: "Track your home's value",
    intro:
      "Stay informed about your property's market value with regular HomesEstimate updates and local sales insights.",
    image: "https://picsum.photos/seed/track-home/1200/600",
    sections: [
      {
        heading: "What is a HomesEstimate?",
        body: [
          "A HomesEstimate is a computer-generated valuation that uses recent comparable sales, property attributes, and council data to estimate the current market value of a home.",
          "It is updated regularly as new sales settle and as council records change. Treat it as a guide rather than a formal valuation.",
        ],
      },
      {
        heading: "How to track your home over time",
        body: [
          "Save your home to your PropertyReach watchlist to receive email updates each time the HomesEstimate refreshes.",
          "Pair it with local sale alerts to see what neighbouring properties are achieving — the most reliable signal for where your own value is heading.",
        ],
      },
      {
        heading: "When you need a registered valuation",
        body: [
          "If you're refinancing, settling a relationship property matter, or applying for KiwiSaver first-home withdrawal, you'll need a registered valuation from a qualified valuer.",
          "A HomesEstimate is not a substitute for that — but it's a useful starting point for understanding your equity position.",
        ],
      },
    ],
  },
  {
    slug: "local-area",
    title: "Understand your local area",
    intro:
      "Find property estimates, sold prices, rateable values, and demographic insights for any New Zealand suburb.",
    image: "https://picsum.photos/seed/local-area/1200/600",
    sections: [
      {
        heading: "Recent sales matter most",
        body: [
          "Sold prices from the past 90 days are the single best indicator of current market conditions in a suburb. Asking prices are aspirational — sold prices are reality.",
          "Use PropertyReach's suburb pages to filter recent sales by property type, bedrooms, and date range.",
        ],
      },
      {
        heading: "Schools, transport, and amenity",
        body: [
          "School zones, public transport access, supermarkets, and parks all influence property value. A small price gap between two seemingly similar suburbs often reflects these underlying differences.",
          "Check zone maps on the Ministry of Education website before relying on the school zone for a property you're considering.",
        ],
      },
      {
        heading: "Council rates and rateable values",
        body: [
          "Each property has a rateable value (RV) used by your local council to calculate rates. RVs are typically updated every three years.",
          "RVs lag behind market value, often by a significant margin. Don't use them as a guide to what a property is currently worth.",
        ],
      },
    ],
  },
  {
    slug: "buying",
    title: "Guide to buying a house",
    intro: "Tips for every part of your home buying journey, from finance to settlement.",
    image: "https://picsum.photos/seed/buying-guide/1200/600",
    sections: [
      {
        heading: "Get your finance sorted first",
        body: [
          "Pre-approval from a bank or mortgage adviser tells you exactly how much you can borrow and signals to sellers that you're a serious buyer.",
          "Most pre-approvals are valid for 90 days. Lock in your approval before you start serious house hunting, not after.",
        ],
      },
      {
        heading: "Do your due diligence",
        body: [
          "Before signing an offer, review the LIM report, title, builder's report, and the property's permitted use under the local district plan.",
          "Conditional offers give you time to do these checks; unconditional offers don't. Don't go unconditional without doing the work.",
        ],
      },
      {
        heading: "Auction vs negotiation",
        body: [
          "Auctions are unconditional — all your due diligence must be complete before auction day. Set your maximum bid in advance and don't go over it.",
          "Negotiated sales let you include conditions like finance, builder's report, and LIM. They're typically slower but more flexible.",
        ],
      },
    ],
  },
  {
    slug: "selling",
    title: "Selling tips and advice",
    intro: "Get the most out of selling your biggest asset.",
    image: "https://picsum.photos/seed/selling-tips/1200/600",
    sections: [
      {
        heading: "Choose your agent carefully",
        body: [
          "Interview at least three agents before signing. Ask about their recent sales in your suburb, marketing strategy, and commission structure.",
          "The cheapest agent isn't always the best value. Look at sale price vs initial appraisal across their recent listings.",
        ],
      },
      {
        heading: "Presentation pays",
        body: [
          "Decluttering, deep cleaning, fresh paint, and styled furniture can lift a property's perceived value by 5–10% — often far more than they cost.",
          "Professional photography and a strong online listing are essential. Most buyers form their first impression before they ever walk through the door.",
        ],
      },
      {
        heading: "Picking the right sale method",
        body: [
          "Auction, deadline sale, tender, and price-by-negotiation each suit different property types and market conditions.",
          "Talk to your agent about which method is achieving the best results for properties like yours in the current market.",
        ],
      },
    ],
  },
];

export function PropertyGuidesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 uppercase tracking-wide">
            Property tools &amp; guides
          </h1>
          <p className="mt-2 text-gray-600">
            Practical guides for tracking, buying, selling, and understanding New Zealand property.
          </p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {guides.map((g) => (
              <a
                key={g.slug}
                href={`#${g.slug}`}
                className="whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
              >
                {g.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
        {guides.map((g) => (
          <section key={g.slug} id={g.slug} className="scroll-mt-20">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-5">
              <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{g.title}</h2>
            <p className="mt-2 text-lg text-gray-600">{g.intro}</p>
            <div className="mt-6 space-y-6">
              {g.sections.map((s) => (
                <div key={s.heading}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.heading}</h3>
                  <div className="space-y-3 text-gray-800 leading-relaxed">
                    {s.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
