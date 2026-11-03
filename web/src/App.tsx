import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SiteConfigProvider } from "./context/SiteConfigContext";
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
import { AdminCampaignsPage } from "./pages/admin/AdminCampaignsPage";
import { AdminCampaignDetailPage } from "./pages/admin/AdminCampaignDetailPage";
import { AdminIntegrationsPage } from "./pages/admin/AdminIntegrationsPage";
import { AdminLeadsPage } from "./pages/admin/AdminLeadsPage";
import { AdminBrandingPage } from "./pages/admin/AdminBrandingPage";
import { AgentSignupPage } from "./pages/AgentSignupPage";
import { AdminContentPage } from "./pages/admin/AdminContentPage";
import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { PropertyNewsPage } from "./pages/PropertyNewsPage";
import { NewsArticleDetailPage } from "./pages/NewsArticleDetailPage";
import { PropertyGuidesPage } from "./pages/PropertyGuidesPage";
import { TradiesPage } from "./pages/TradiesPage";
import { TradieDetailPage } from "./pages/TradieDetailPage";
import { AdminTradiesPage } from "./pages/admin/AdminTradiesPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsPage } from "./pages/TermsPage";
import { DataDeletionPage } from "./pages/DataDeletionPage";
import { Footer } from "./components/layout/Footer";
import { ProtectedRoute, SuperAdminRoute } from "./components/auth/ProtectedRoute";
import { useApiAuthStore } from "./store/apiAuthStore";
import { isPublicSiteEnabled } from "./config/features";
import { PublicSiteOffRedirect } from "./components/routing/PublicSiteOffRedirect";
import { MorePage } from "./pages/MorePage";
import { PwaUpdatePrompt } from "./components/pwa/PwaUpdatePrompt";
import { AppBottomNav, shouldHideAppBottomNav } from "./components/layout/AppBottomNav";
import { useAppShellMode } from "./hooks/useAppShellMode";

function AppShell({ publicSite }: { publicSite: boolean }) {
  const location = useLocation();
  const hideBottomNav = shouldHideAppBottomNav(location.pathname);
  const appShell = useAppShellMode();
  const padForTabs = appShell && !hideBottomNav;

  return (
    <div className={`min-h-dvh bg-white flex flex-col ${appShell ? "app-shell app-shell--mobile" : "app-shell"}`}>
      <Header />
      <main
        className={`flex-1 min-w-0 ${
          padForTabs ? "pb-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)]" : ""
        }`}
      >
        <Routes>
          {publicSite ? (
            <>
              <Route path="/" element={<Navigate to="/sale" replace />} />
              <Route path="/sale" element={<BrowsePage />} />
              <Route path="/rent" element={<BrowsePage />} />
              <Route path="/flatmates" element={<BrowsePage />} />
              <Route path="/property/residential/sale/search" element={<ResultsPage />} />
              <Route path="/property/residential/rent/search" element={<ResultsPage />} />
              <Route path="/property/residential/flatmates/search" element={<ResultsPage />} />
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
              <Route path="/news/:slug" element={<NewsArticleDetailPage />} />
              <Route path="/guides" element={<PropertyGuidesPage />} />
              <Route path="/guides/:slug" element={<PropertyGuidesPage />} />
              <Route path="/tradies" element={<TradiesPage />} />
              <Route path="/tradies/:slug" element={<TradieDetailPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/data-deletion" element={<DataDeletionPage />} />
            </>
          ) : (
            <>
              <Route path="/" element={<PublicSiteOffRedirect />} />
              <Route path="/sale" element={<PublicSiteOffRedirect />} />
              <Route path="/rent" element={<PublicSiteOffRedirect />} />
              <Route path="/flatmates" element={<PublicSiteOffRedirect />} />
              <Route path="/property/residential/sale/search" element={<PublicSiteOffRedirect />} />
              <Route path="/property/residential/rent/search" element={<PublicSiteOffRedirect />} />
              <Route path="/property/residential/flatmates/search" element={<PublicSiteOffRedirect />} />
              <Route
                path="/property/residential/:listingType/:region/:district/:suburb/listing/:id"
                element={<PublicSiteOffRedirect />}
              />
              <Route path="/results" element={<PublicSiteOffRedirect />} />
              <Route path="/listing/:id" element={<PublicSiteOffRedirect />} />
            </>
          )}

          {/* Legal pages — always accessible regardless of public site toggle */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/data-deletion" element={<DataDeletionPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/agent-signup" element={<AgentSignupPage />} />
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
          <Route
            path="/admin/campaigns"
            element={
              <SuperAdminRoute>
                <AdminCampaignsPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin/campaigns/:id"
            element={
              <SuperAdminRoute>
                <AdminCampaignDetailPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin/integrations"
            element={
              <SuperAdminRoute>
                <AdminIntegrationsPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <SuperAdminRoute>
                <AdminLeadsPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin/branding"
            element={
              <SuperAdminRoute>
                <AdminBrandingPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin/tradies"
            element={
              <SuperAdminRoute>
                <AdminTradiesPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <SuperAdminRoute>
                <AdminContentPage />
              </SuperAdminRoute>
            }
          />

          {!publicSite && <Route path="*" element={<PublicSiteOffRedirect />} />}
        </Routes>
      </main>
      {/* Website footer — desktop only */}
      <div className={appShell ? "hidden" : "hidden lg:block"}>
        <Footer />
      </div>
      <AppBottomNav />
      <PwaUpdatePrompt />
    </div>
  );
}

function App() {
  const publicSite = isPublicSiteEnabled();

  useEffect(() => {
    useApiAuthStore.getState().syncRoleFromToken();
  }, []);

  return (
    <SiteConfigProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <GoogleAnalytics />
        <AppShell publicSite={publicSite} />
      </BrowserRouter>
    </SiteConfigProvider>
  );
}

export default App;
