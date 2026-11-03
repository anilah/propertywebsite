import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackMetaLead } from './metaPixel';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || '';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function loadGtag(measurementId: string) {
  if (document.getElementById('gtag-script')) return;

  const script = document.createElement('script');
  script.id = 'gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
}

/** Sends a GA4 page_view hit for the current path. */
export function trackPageView(path: string) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: path });
}

/** Generic GA4 event helper. */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

// ─── Listing-specific GA4 events ─────────────────────────────────────────────

export interface ListingEventItem {
  id: string;
  headline: string;
  listingType: string;
  propertyType?: string;
  suburb?: string;
  district?: string;
  region?: string;
  price?: number | null;
  rentPerWeek?: number | null;
  bedrooms?: number;
  agencyDisplayName?: string;
}

function toGa4Item(l: ListingEventItem, index = 0) {
  return {
    item_id: l.id,
    item_name: l.headline,
    item_category: l.listingType,          // SALE | RENT | FLATMATES
    item_category2: l.propertyType ?? '',
    item_category3: l.suburb ?? '',
    item_category4: l.district ?? '',
    item_category5: l.region ?? '',
    affiliation: l.agencyDisplayName ?? '',
    price: l.price ?? l.rentPerWeek ?? 0,
    quantity: 1,
    index,
  };
}

/** Fired when a listing detail page loads. GA4 e-commerce: view_item */
export function trackListingView(listing: ListingEventItem) {
  trackEvent('view_item', {
    currency: 'NZD',
    value: listing.price ?? listing.rentPerWeek ?? 0,
    items: [toGa4Item(listing)],
  });
}

/** Fired when an enquiry form is submitted. GA4 e-commerce: generate_lead + Meta Lead */
export function trackEnquiry(listing: ListingEventItem) {
  trackEvent('generate_lead', {
    currency: 'NZD',
    value: listing.price ?? listing.rentPerWeek ?? 0,
    items: [toGa4Item(listing)],
  });
  trackMetaLead();
}

/** Fired when the agent phone number is revealed. */
export function trackPhoneReveal(listing: ListingEventItem) {
  trackEvent('phone_reveal', {
    listing_id: listing.id,
    listing_type: listing.listingType,
    suburb: listing.suburb ?? '',
    agency: listing.agencyDisplayName ?? '',
  });
}

/** Fired when a visitor taps Call or WhatsApp on a tradie. */
export function trackTradieContact(
  tradie: { id: string; businessName: string; categories: string[] },
  channel: 'call' | 'whatsapp',
) {
  trackEvent('tradie_contact', {
    tradie_id: tradie.id,
    tradie_name: tradie.businessName,
    category: tradie.categories[0] ?? '',
    channel,
  });
}

/** Fired when search results are displayed. GA4 e-commerce: view_item_list */
export function trackSearchResults(
  listings: ListingEventItem[],
  listName: string,
  searchTerm?: string,
) {
  if (listings.length === 0) return;
  if (searchTerm) {
    trackEvent('search', { search_term: searchTerm });
  }
  trackEvent('view_item_list', {
    item_list_name: listName,
    items: listings.slice(0, 20).map((l, i) => toGa4Item(l, i)),
  });
}

/** Fired when a listing card is clicked in search results. GA4 e-commerce: select_item */
export function trackListingClick(listing: ListingEventItem, listName: string, index: number) {
  trackEvent('select_item', {
    item_list_name: listName,
    items: [toGa4Item(listing, index)],
  });
}

/**
 * Drop this once inside <BrowserRouter>.
 * It loads gtag.js on mount and fires a page_view on every route change.
 */
export function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) return;
    loadGtag(GA_ID);
  }, []);

  useEffect(() => {
    if (!GA_ID) return;
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}
