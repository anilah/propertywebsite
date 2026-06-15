export function PropertyTools() {
  const tools = [
    {
      title: "Track your home's value",
      description: "Get updates when your HomesEstimate is refreshed.",
      image: "https://picsum.photos/seed/track-home/400/250",
      link: "/guides#track-home-value",
    },
    {
      title: "Understand your local area",
      description: "Find property estimates, sold prices, rateable values, and more.",
      image: "https://picsum.photos/seed/local-area/400/250",
      link: "/guides#local-area",
    },
    {
      title: "Guide to buying a house",
      description: "Tips for every part of your home buying journey.",
      image: "https://picsum.photos/seed/buying-guide/400/250",
      link: "/guides#buying",
    },
    {
      title: "Selling tips and advice",
      description: "Get the most out of selling your biggest asset.",
      image: "https://picsum.photos/seed/selling-tips/400/250",
      link: "/guides#selling",
    },
  ];

  return (
    <section className="pt-6 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
          Property tools and guides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <a
              key={index}
              href={tool.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
