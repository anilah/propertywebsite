import { FilterBar } from "../components/listings/FilterBar";
import { PropertyTools } from "../components/home/PropertyTools";
import { PropertyNews } from "../components/home/PropertyNews";

export function BrowsePage() {
  // This page now just shows the search form and content sections
  // Property listings will be shown on a separate results page when user searches

  return (
    <div className="min-h-screen bg-white">
      <FilterBar />

      {/* Property Tools Section */}
      <PropertyTools />

      {/* Property News Section */}
      <PropertyNews />
    </div>
  );
}
