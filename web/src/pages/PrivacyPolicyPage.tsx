import { useSiteConfig } from '../context/SiteConfigContext';

export function PrivacyPolicyPage() {
  const { config } = useSiteConfig();
  const siteName = config.siteName;
  const lastUpdated = 'July 2026';
  const contactEmail = 'privacy@kaboohomes.com';
  const siteUrl = 'https://kaboohomes.com';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{siteName} Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                {siteName} ("we", "us", or "our") operates {siteUrl} and related services. This Privacy Policy
                explains how we collect, use, disclose, and protect your personal information in accordance with
                the New Zealand Privacy Act 2020 and applicable data protection laws.
              </p>
              <p className="mt-3">
                By using our platform, you agree to the practices described in this policy. If you do not agree,
                please discontinue use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p className="mb-3">We may collect the following categories of personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contact information:</strong> Name, email address, phone number (mobile and office)</li>
                <li><strong>Account credentials:</strong> Mobile number used for login, PIN (stored encrypted)</li>
                <li><strong>Professional information:</strong> Real estate licence number, agency name, profile photo</li>
                <li><strong>Listing data:</strong> Property details, images, videos, and documents you upload</li>
                <li><strong>Usage data:</strong> Pages visited, search queries, listing views, and interaction logs</li>
                <li><strong>Device information:</strong> Browser type, IP address, operating system</li>
                <li><strong>Communications:</strong> Enquiries submitted through listing pages, lead forms from ad campaigns</li>
                <li><strong>Social platform data:</strong> If you connect Meta (Facebook/Instagram), Google, or TikTok accounts, we receive data necessary to run and track ad campaigns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and improve our property listing and marketing platform</li>
                <li>Authenticate your account and manage your agent profile</li>
                <li>Display property listings to prospective buyers and renters</li>
                <li>Facilitate and track advertising campaigns on Meta, Google Ads, and TikTok</li>
                <li>Send you transactional notifications (e.g. lead alerts, campaign status updates)</li>
                <li>Comply with legal obligations under New Zealand law</li>
                <li>Detect and prevent fraud, abuse, or unauthorised access</li>
                <li>Analyse aggregate usage to improve platform performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing Your Information</h2>
              <p className="mb-3">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service providers:</strong> AWS (hosting, storage), Prisma/database providers, email/SMS providers — bound by confidentiality obligations</li>
                <li><strong>Advertising platforms:</strong> Meta (Facebook/Instagram), Google Ads, TikTok — only data necessary to run campaigns you explicitly create</li>
                <li><strong>Other users:</strong> Agent contact details (name, photo, agency) displayed publicly on listings</li>
                <li><strong>Legal authorities:</strong> Where required by New Zealand law, court order, or to protect rights and safety</li>
              </ul>
              <p className="mt-3">We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to maintain sessions, remember preferences, and analyse
                site usage via Google Analytics. You can disable cookies in your browser settings, though this
                may affect platform functionality. By continuing to use the site, you consent to our use of cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
              <p>
                We retain personal information for as long as your account is active or as needed to provide
                services. When you delete your account or request deletion, we will remove or anonymise your
                data within 30 days, except where retention is required by law or legitimate business purposes
                (e.g. financial records).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Facebook / Meta Data</h2>
              <p>
                If you use our platform to publish campaigns via Meta (Facebook/Instagram), we access your
                Facebook Page, Ad Account, and related advertising data solely to execute campaigns on your behalf.
                We do not store Facebook user data beyond what is necessary to operate and report on your campaigns.
              </p>
              <p className="mt-3">
                Users who have interacted with a Facebook Lead Ad may request deletion of their data. To submit
                a data deletion request, visit our{' '}
                <a href="/data-deletion" className="text-primary-600 underline hover:text-primary-700">
                  Data Deletion page
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your Rights</h2>
              <p className="mb-3">Under the New Zealand Privacy Act 2020, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal retention requirements)</li>
                <li>Object to or restrict certain types of processing</li>
                <li>Lodge a complaint with the Office of the Privacy Commissioner</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at{' '}
                <a href={`mailto:${contactEmail}`} className="text-primary-600 underline hover:text-primary-700">
                  {contactEmail}
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Security</h2>
              <p>
                We implement industry-standard security measures including encrypted data transmission (TLS),
                encrypted storage of sensitive credentials (AES-256-GCM), and access controls. Despite these
                measures, no internet transmission is completely secure and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Third-Party Links</h2>
              <p>
                Our platform may contain links to third-party websites (e.g. Google Maps, Trade Me). We are not
                responsible for the privacy practices of these sites and encourage you to review their policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify registered users of material
                changes by email or in-app notification. Continued use of our platform after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
              <p>
                For privacy-related enquiries, data access or deletion requests, or complaints, please contact:
              </p>
              <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm space-y-1">
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
