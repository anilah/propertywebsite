import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { BrowsePage } from "./pages/BrowsePage";
import { ResultsPage } from "./pages/ResultsPage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { AdminListingsPage } from "./pages/admin/AdminListingsPage";
import { AdminListingFormPage } from "./pages/admin/AdminListingFormPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminSetupPage } from "./pages/admin/AdminSetupPage";
import { AdminAgentsPage } from "./pages/admin/AdminAgentsPage";
import { AdminProfilePage } from "./pages/admin/AdminProfilePage";
import { PropertyNewsPage } from "./pages/PropertyNewsPage";
import { NewsArticleDetailPage } from "./pages/NewsArticleDetailPage";
import { PropertyGuidesPage } from "./pages/PropertyGuidesPage";
import { ProtectedRoute, SuperAdminRoute } from "./components/auth/ProtectedRoute";
import { useApiAuthStore } from "./store/apiAuthStore";
import { isPublicSiteEnabled } from "./config/features";
import { PublicSiteOffRedirect } from "./components/routing/PublicSiteOffRedirect";

function App() {
  const publicSite = isPublicSiteEnabled();

  useEffect(() => {
    useApiAuthStore.getState().syncRoleFromToken();
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          {publicSite ? (
            <>
              <Route path="/" element={<Navigate to="/sale" replace />} />
              <Route path="/sale" element={<BrowsePage />} />
              <Route path="/rent" element={<BrowsePage />} />
              <Route path="/property/residential/sale/search" element={<ResultsPage />} />
              <Route path="/property/residential/rent/search" element={<ResultsPage />} />
              <Route
                path="/property/residential/:listingType/:region/:district/:suburb/listing/:id"
                element={<ListingDetailPage />}
              />
              <Route
                path="/results"
                element={<Navigate to="/property/residential/sale/search" replace />}
              />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="/news" element={<PropertyNewsPage />} />
              <Route path="/news/:id" element={<NewsArticleDetailPage />} />
              <Route path="/guides" element={<PropertyGuidesPage />} />
            </>
          ) : (
            <>
              <Route path="/" element={<PublicSiteOffRedirect />} />
              <Route path="/sale" element={<PublicSiteOffRedirect />} />
              <Route path="/rent" element={<PublicSiteOffRedirect />} />
              <Route path="/property/residential/sale/search" element={<PublicSiteOffRedirect />} />
              <Route path="/property/residential/rent/search" element={<PublicSiteOffRedirect />} />
              <Route
                path="/property/residential/:listingType/:region/:district/:suburb/listing/:id"
                element={<PublicSiteOffRedirect />}
              />
              <Route path="/results" element={<PublicSiteOffRedirect />} />
              <Route path="/listing/:id" element={<PublicSiteOffRedirect />} />
            </>
          )}

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/setup" element={<AdminSetupPage />} />
          <Route
            path="/admin/signup"
            element={
              <SuperAdminRoute>
                <AdminAgentsPage initialCreateOpen />
              </SuperAdminRoute>
            }
          />
          <Route path="/admin/pending" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <SuperAdminRoute>
                <AdminAgentsPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute>
                <AdminListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings/new"
            element={
              <ProtectedRoute>
                <AdminListingFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings/:id/edit"
            element={
              <ProtectedRoute>
                <AdminListingFormPage />
              </ProtectedRoute>
            }
          />

          {!publicSite && <Route path="*" element={<PublicSiteOffRedirect />} />}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
