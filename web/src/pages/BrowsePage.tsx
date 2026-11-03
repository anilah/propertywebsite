import { Navigate, useLocation } from "react-router-dom";
import { FilterBar } from "../components/listings/FilterBar";
import { MobileHomeSearch } from "../components/listings/MobileHomeSearch";
import { CategoryListingsSection } from "../components/listings/CategoryListingsSection";
import { PropertyTools } from "../components/home/PropertyTools";
import { PropertyNews } from "../components/home/PropertyNews";
import { useAppShellMode } from "../hooks/useAppShellMode";
import { useHasFlatmateListings } from "../hooks/useHasFlatmateListings";

export function BrowsePage() {
  const appShell = useAppShellMode();
  const location = useLocation();
  const hasFlatmates = useHasFlatmateListings();
  const onFlatmates =
    location.pathname === "/flatmates" ||
    location.pathname.startsWith("/property/residential/flatmates");

  if (onFlatmates && hasFlatmates === false) {
    return <Navigate to="/sale" replace />;
  }

  return (
    <div className="min-h-full bg-white">
      {/*
        Always mount FilterBar. CSS forces it on desktop (mouse/trackpad) even if
        a stale SW briefly sets appShell=true — that was the prod desktop bug.
      */}
      <div className="kaboo-web-browse">
        <FilterBar />
      </div>
      {appShell && (
        <div className="kaboo-shell-browse">
          <MobileHomeSearch />
        </div>
      )}

      <CategoryListingsSection />

      <div className={appShell ? "kaboo-shell-browse px-0 pt-2" : undefined}>
        <PropertyNews />
        <PropertyTools />
      </div>
    </div>
  );
}
