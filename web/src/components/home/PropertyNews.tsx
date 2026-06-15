import { useState } from "react";
import { Link } from "react-router-dom";
import { newsArticles } from "../../data/newsArticles";

export function PropertyNews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Show the most recent non-featured articles on the home page.
  const homeArticles = newsArticles.filter((a) => !a.featured).slice(0, 5);
  const visibleArticles = homeArticles.slice(currentIndex, currentIndex + 3);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      Math.min(homeArticles.length - 3, prev + 1)
    );
  };

  return (
    <section className="pt-6 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Latest property news
          </h2>
          <Link
            to="/news"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
          >
            View all
          </Link>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-shadow"
              aria-label="Previous articles"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {currentIndex < homeArticles.length - 3 && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-shadow"
              aria-label="Next articles"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* News Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArticles.map((article) => (
              <a
                key={article.id}
                href={`/news/${article.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <p className="text-xs text-gray-500">{article.date}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
