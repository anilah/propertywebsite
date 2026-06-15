import { useState } from "react";
import { Listing } from "../../types";
import { PromotedListingCard } from "./PromotedListingCard";

interface PromotedListingsCarouselProps {
  listings: Listing[];
}

export function PromotedListingsCarousel({ listings }: PromotedListingsCarouselProps) {
  const [index, setIndex] = useState(0);

  if (listings.length === 0) return null;

  const total = listings.length;
  const current = listings[index];

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Featured properties
          <span className="text-gray-400 font-normal normal-case tracking-normal">
            ({index + 1} of {total})
          </span>
        </h2>
      </div>

      <div className="relative">
        {/* One full-width card per slide */}
        <PromotedListingCard listing={current} />

        {/* Prev arrow */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous featured property"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-lg transition-shadow z-30"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next featured property"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 w-10 h-10 sm:w-11 sm:h-11 bg-white hover:bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shadow-lg transition-shadow z-30"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {listings.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to featured property ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-orange-500" : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
