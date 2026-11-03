import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contentApi, type ContentPostSummary } from "../../services/api";

export function PropertyNews() {
  const [articles, setArticles] = useState<ContentPostSummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    contentApi.listPosts({ type: 'news', limit: 5 })
      .then(r => setArticles(r.posts))
      .catch(() => {});
  }, []);

  const visibleArticles = articles.slice(currentIndex, currentIndex + 3);

  if (articles.length === 0) return null;

  return (
    <section className="pt-6 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Latest property news
          </h2>
          <Link
            to="/news"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
          >
            View all
          </Link>
        </div>

        <div className="relative">
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-shadow"
              aria-label="Previous articles"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {currentIndex < articles.length - 3 && (
            <button
              onClick={() => setCurrentIndex(i => Math.min(articles.length - 3, i + 1))}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-shadow"
              aria-label="Next articles"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArticles.map(article => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-5">
                  {article.category && (
                    <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">{article.category}</span>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(article.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {article.readTime && ` · ${article.readTime}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
