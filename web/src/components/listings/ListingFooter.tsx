function ListingFooter() {
  return (
    <div className="w-full bg-white border-t border-gray-200">
      {/* Top section - Page views and listing info */}
      <div className="border-b border-gray-200 bg-gray-50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>
              Page views:{" "}
              <span className="font-semibold text-gray-800">904</span>
            </span>
          </div>
          <span className="hidden sm:inline text-gray-400">•</span>
          <div className="flex items-center gap-1">
            <span>Listing #5764600478</span>
          </div>
        </div>

        {/* Community Watch */}
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
          <svg className="w-4 h-4 text-yellow-500 fill-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Community Watch:</span>
          <a href="#" className="text-blue-600 hover:underline">
            Report this listing
          </a>
        </div>
      </div>

      {/* Bottom section - System upgrade notice */}
      <div className="py-3 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span>We are upgrading some of our systems</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Tell us what you think</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingFooter;
