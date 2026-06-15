import { useState } from "react";
import { Link } from "react-router-dom";
import { newsArticles } from "../data/newsArticles";

const categories = [
  "All",
  "Market news",
  "Buying & selling",
  "Home and living",
  "Explore",
  "Feature article",
  "Market research",
];

export function PropertyNewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featured = newsArticles.find((a) => a.featured)!;
  const rest = newsArticles.filter((a) => !a.featured);

  const filtered = rest.filter((a) => {
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 uppercase tracking-wide">
            Property News &amp; Advice
          </h1>
          {/* Search bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 max-w-lg"
          >
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news & advice"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured article hero — only shown on "All" */}
        {activeCategory === "All" && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest on property</h2>
            <Link
              to={`/news/${featured.id}`}
              className="relative block rounded-xl overflow-hidden group"
            >
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-72 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                <span className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Featured article
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-2">
                  {featured.title}
                </h3>
                <p className="text-gray-300 text-sm">{featured.description}</p>
                <p className="text-gray-400 text-xs mt-1">{featured.date}</p>
              </div>
            </Link>
          </section>
        )}

        {/* News grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {activeCategory === "All" ? "Property news" : activeCategory}
          </h2>

          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm py-8">No articles in this category yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article) => (
                <Link
                  to={`/news/${article.id}`}
                  key={article.id}
                  className="group block bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                      {article.category}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{article.description}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {article.date} &middot; {article.readTime}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
