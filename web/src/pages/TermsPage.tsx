import { useSiteConfig } from '../context/SiteConfigContext';

export function TermsPage() {
  const { config } = useSiteConfig();
  const siteName = config.siteName;
  const lastUpdated = 'July 2026';
  const contactEmail = 'legal@kaboohomes.com';
  const siteUrl = 'https://kaboohomes.com';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated} · {siteName} — {siteUrl}</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using {siteName} ("the Platform", "we", "us", or "our"), you agree to be bound
                by these Terms &amp; Conditions and our{' '}
                <a href="/privacy-policy" className="text-primary-600 underline hover:text-primary-700">Privacy Policy</a>.
                If you do not accept these terms, you must not use the Platform.
              </p>
              <p className="mt-3">
                These Terms govern use of {siteUrl} and any related applications or services operated by {siteName}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Platform Description</h2>
              <p>
                {siteName} is a New Zealand property listing and marketing platform that allows licensed real
                estate agents ("Agents") to list properties for sale or rent, and enables members of the public
                to browse and enquire about properties.
              </p>
              <p className="mt-3">
                The Platform also provides tools for Agents to create and manage advertising campaigns on
                Meta (Facebook/Instagram), Google Ads, and TikTok.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Agent Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be a licensed real estate agent or salesperson under the Real Estate Agents Act 2008 to create an Agent account</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials (mobile number and PIN)</li>
                <li>You must provide accurate and up-to-date information including your REAA licence number</li>
                <li>Accounts are subject to approval by a Platform administrator</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms or applicable law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Listing Content</h2>
              <p className="mb-3">When submitting property listings, you agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All information is accurate, not misleading, and complies with the Fair Trading Act 1986</li>
                <li>You have the right to list the property (authority to act from the vendor/landlord)</li>
                <li>All images, videos, and documents you upload are owned by you or you have appropriate licences</li>
                <li>Listings comply with the Real Estate Agents Act 2008 and associated regulations</li>
                <li>You will promptly update or remove listings when properties are sold, let, or withdrawn</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Advertising Campaigns</h2>
              <p className="mb-3">When using our campaign management features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for campaign content complying with Meta, Google, and TikTok advertising policies</li>
                <li>You must have the necessary permissions and licences to use any creative content in campaigns</li>
                <li>Ad spend is managed directly through your connected advertising accounts — {siteName} does not charge for or guarantee campaign performance</li>
                <li>You indemnify {siteName} against any claims arising from your advertising content</li>
                <li>Campaign data (leads, impressions, etc.) is provided for informational purposes only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
              <p>
                The {siteName} platform, including its design, code, trademarks, and content created by us,
                is owned by or licenced to {siteName}. You may not reproduce, distribute, or create derivative
                works without our express written consent.
              </p>
              <p className="mt-3">
                Content you submit (listings, photos, videos) remains your property. You grant {siteName} a
                non-exclusive, worldwide licence to display, reproduce, and distribute your content for the
                purpose of operating the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Prohibited Conduct</h2>
              <p className="mb-3">You must not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Post false, misleading, or fraudulent listings or content</li>
                <li>Use the Platform for any unlawful purpose under New Zealand law</li>
                <li>Attempt to gain unauthorised access to other accounts or system components</li>
                <li>Scrape, harvest, or systematically extract Platform data without permission</li>
                <li>Interfere with or disrupt the Platform's infrastructure or security</li>
                <li>Use the Platform to send unsolicited communications (spam)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided "as is" without warranties of any kind, express or implied. We do not
                warrant that the Platform will be uninterrupted, error-free, or that listing information is
                complete or accurate. Property information is provided by Agents and we are not responsible for
                its accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by New Zealand law, {siteName} shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from your use of
                the Platform. Our total liability shall not exceed NZD $100 or the amount you have paid us
                in the past 12 months, whichever is greater.
              </p>
              <p className="mt-3">
                Nothing in these Terms limits liability for death, personal injury, or fraud caused by our
                negligence, or any liability that cannot be excluded under the Consumer Guarantees Act 1993
                or Fair Trading Act 1986.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Third-Party Services</h2>
              <p>
                Our Platform integrates with third-party services including Meta, Google, TikTok, AWS, and
                mapping providers. Your use of these services is governed by their respective terms and
                privacy policies. We are not responsible for the availability, accuracy, or practices of
                third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
              <p>
                These Terms are governed by the laws of New Zealand. Any disputes will be subject to the
                exclusive jurisdiction of the New Zealand courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. We will notify registered users of material changes.
                Continued use of the Platform after changes take effect constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                <p><strong>{siteName}</strong></p>
                <p>New Zealand</p>
                <p>Email: <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">{contactEmail}</a></p>
                <p>Website: <a href={siteUrl} className="text-primary-600 underline">{siteUrl}</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
