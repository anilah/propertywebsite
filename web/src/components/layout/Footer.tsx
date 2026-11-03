import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../context/SiteConfigContext';

export function Footer() {
  const { config } = useSiteConfig();
  const siteName = config.siteName;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-10 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 pb-safe">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Brand */}
          <div>
            <p className="text-white font-semibold text-sm">{siteName}</p>
            <p className="text-xs mt-1">New Zealand's Premier Property Portal</p>
          </div>

          {/* Legal links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <Link to="/tradies" className="hover:text-white transition-colors">
              Find a tradie
            </Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/data-deletion" className="hover:text-white transition-colors">
              Data Deletion
            </Link>
            <a
              href="mailto:privacy@kaboohomes.com"
              className="hover:text-white transition-colors"
            >
              Contact Us
            </a>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-center sm:text-left">
          © {year} {siteName}. All rights reserved. Licensed real estate platform operating in
          New Zealand under the Real Estate Agents Act 2008.
        </div>
      </div>
    </footer>
  );
}
