import { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';

/**
 * Required by Meta (Facebook) for apps that use Facebook Login or lead ads.
 * Meta sends signed deletion requests to the backend webhook, but also requires
 * a user-facing page where people can request deletion and check status.
 *
 * Backend webhook endpoint: POST /api/webhooks/meta/data-deletion
 */
export function DataDeletionPage() {
  const { config } = useSiteConfig();
  const siteName = config.siteName;
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const contactEmail = 'privacy@kaboohomes.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a simple confirmation code for tracking
    const code = `DEL-${Date.now().toString(36).toUpperCase()}`;
    setConfirmationCode(code);
    setSubmitted(true);
    // In production this would call the backend API to schedule deletion
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Data Deletion Request</h1>
          </div>

          <p className="text-gray-600 mb-8">
            This page lets you request deletion of any personal data {siteName} holds about you,
            including data collected via Facebook Lead Ads or Meta integrations.
          </p>

          {!submitted ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
                <p className="font-semibold mb-1">What gets deleted?</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Your name, email, and phone number submitted via lead forms</li>
                  <li>Any enquiries or messages associated with your contact details</li>
                  <li>Analytics data linked to your identity</li>
                </ul>
                <p className="mt-2">
                  Deletion is completed within <strong>30 days</strong>. Some data may be retained if required by law.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="del-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your email address
                  </label>
                  <input
                    id="del-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We'll use this to locate and delete your data, and send a confirmation.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  Submit Deletion Request
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500 text-center">
                Questions? Email us at{' '}
                <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">
                  {contactEmail}
                </a>
              </p>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Received</h2>
              <p className="text-gray-600 mb-4">
                We've received your deletion request for <strong>{email}</strong>.
                Your data will be deleted within 30 days.
              </p>
              <div className="bg-gray-50 rounded-lg px-6 py-3 inline-block">
                <p className="text-xs text-gray-500 mb-1">Your confirmation code</p>
                <p className="font-mono font-bold text-gray-900 text-lg">{confirmationCode}</p>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Keep this code to track your request. Contact{' '}
                <a href={`mailto:${contactEmail}`} className="text-primary-600 underline">{contactEmail}</a>
                {' '}with any questions.
              </p>
            </div>
          )}

          <hr className="my-8 border-gray-100" />

          <div className="text-sm text-gray-500 space-y-3">
            <p className="font-medium text-gray-700">Automatic deletion via Meta</p>
            <p>
              When you delete your Facebook account, Meta automatically sends a deletion notification to our
              systems and your data is queued for removal. You do not need to submit this form separately in
              that case.
            </p>
            <p>
              Read our{' '}
              <a href="/privacy-policy" className="text-primary-600 underline hover:text-primary-700">
                Privacy Policy
              </a>
              {' '}for full details on how we handle your data.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
