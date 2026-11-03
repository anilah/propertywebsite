declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Meta Pixel Lead — call only after the server confirms the enquiry was saved. */
export function trackMetaLead() {
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', 'Lead');
}
