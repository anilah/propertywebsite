import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contentApi, type ContentPostSummary } from "../../services/api";

export function PropertyTools() {
  const [guides, setGuides] = useState<ContentPostSummary[]>([]);

  useEffect(() => {
    contentApi.listPosts({ type: 'guide', limit: 8 })
      .then(r => setGuides(r.posts))
      .catch(() => {});
  }, []);

  if (guides.length === 0) return null;

  return (
    <section className="pt-6 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Property tools and guides
          </h2>
          <Link to="/guides" className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map(guide => (
            <Link
              key={guide.id}
              to={`/guides/${guide.slug}`}
              className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                {guide.imageUrl && (
                  <img
                    src={guide.imageUrl}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">{guide.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
