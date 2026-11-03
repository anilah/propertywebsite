import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contentApi, type ContentPostSummary } from "../services/api";

export function PropertyNewsPage() {
  const [allPosts, setAllPosts] = useState<ContentPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    contentApi.listPosts({ type: 'news', limit: 100 })
      .then(r => setAllPosts(r.posts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(allPosts.map(a => a.category).filter(Boolean))) as string[]];
  const featured = allPosts.find(a => a.featured);
  const rest = allPosts.filter(a => !a.featured);

  const filtered = rest.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-2 block">← Back to search</Link>
              <h1 className="text-3xl font-bold text-gray-900">Property News</h1>
            </div>
            <input
              type="text"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {/* Category tabs */}
          <div className="flex gap-2 mt-5 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Featured hero — only on "All" */}
            {featured && activeCategory === "All" && !searchQuery && (
              <Link to={`/news/${featured.slug}`} className="group block mb-10">
                <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[16/7] shadow-xl">
                  {featured.imageUrl && (
                    <img src={featured.imageUrl} alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                    {featured.category && (
                      <span className="inline-block mb-2 text-xs font-bold uppercase tracking-widest text-primary-300 bg-primary-900/60 rounded-full px-3 py-1 w-fit">
                        {featured.category}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 max-w-3xl leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-gray-200 text-sm sm:text-base max-w-2xl line-clamp-2">{featured.excerpt}</p>
                    <p className="text-gray-400 text-xs mt-3">
                      {new Date(featured.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {featured.readTime && ` · ${featured.readTime}`}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-16">No articles found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(article => (
                  <Link key={article.id} to={`/news/${article.slug}`}
                    className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                    <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
                      {article.imageUrl && (
                        <img src={article.imageUrl} alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="p-5">
                      {article.category && (
                        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{article.category}</span>
                      )}
                      <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
                      <p className="mt-3 text-xs text-gray-400">
                        {new Date(article.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {article.readTime && ` · ${article.readTime}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
