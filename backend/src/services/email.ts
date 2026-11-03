import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true', // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EnquiryEmailOptions {
  /** Primary recipient (agent and/or admin inbox) */
  to: string | string[];
  recipientName: string;
  listingAddress: string;
  listingId: string;
  enquirerName: string;
  enquirerEmail: string;
  enquirerPhone?: string;
  message: string;
  isViewingRequest?: boolean;
  /** Shown when agent email was missing and admin is being notified instead/as well */
  note?: string;
  /** e.g. "Facebook post (Kaboo campaign)" — where the enquirer clicked through from */
  leadSource?: string;
}

export interface BuyerConfirmationOptions {
  buyerEmail: string;
  buyerName: string;
  listingAddress: string;
  listingId: string;
}

const siteName = process.env.SITE_NAME || 'Kaboo Homes';
const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@kaboohomes.com';
const fromName = process.env.EMAIL_FROM_NAME || siteName;
const siteUrl = (process.env.SITE_URL || 'https://kaboohomes.com').replace(/\/$/, '');

function listingUrl(listingId: string): string {
  return `${siteUrl}/listing/${listingId}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Confirmation email to the buyer who submitted the enquiry */
export async function sendBuyerEnquiryConfirmation(opts: BuyerConfirmationOptions): Promise<{ messageId?: string }> {
  const url = listingUrl(opts.listingId);
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:28px 32px">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">${escapeHtml(siteName)}</h1>
            <p style="margin:6px 0 0;color:#ccfbf1;font-size:14px">We received your enquiry</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 16px;font-size:16px;color:#111827">Hi ${escapeHtml(opts.buyerName)},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.55">
              Thanks for your interest in <strong>${escapeHtml(opts.listingAddress)}</strong>.
              We’ve passed your message to the listing agent, who will be in touch shortly.
            </p>
            <a href="${url}"
               style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
              View the property
            </a>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5">
              If you didn’t submit this enquiry, you can ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e5e7eb;background:#f9fafb">
            <p style="margin:0;font-size:12px;color:#9ca3af">${escapeHtml(siteName)} · <a href="${siteUrl}" style="color:#0d9488">${siteUrl}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: opts.buyerEmail,
    subject: `We received your enquiry – ${opts.listingAddress}`,
    html,
  });
  return { messageId: info.messageId };
}

export type EmailAttemptStatus = 'sent' | 'failed' | 'skipped';

export interface EmailAttemptAudit {
  role: 'agent' | 'admin' | 'buyer';
  to: string[];
  status: EmailAttemptStatus;
  error?: string;
  messageId?: string;
  at: string;
}

export interface EnquiryEmailAudit {
  smtpConfigured: boolean;
  from: string;
  attempts: EmailAttemptAudit[];
  completedAt: string;
}

/** Normalize nodemailer / SES errors into an admin-readable string. */
export function formatEmailError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/MessageRejected|Email address is not verified|Sandbox/i.test(msg)) {
    return `${msg} — SES may be in sandbox: verify recipient addresses (or move out of sandbox).`;
  }
  if (/InvalidClientTokenId|Authentication|535|Username and Password not accepted/i.test(msg)) {
    return `${msg} — check SMTP_USER / SMTP_PASS SES credentials.`;
  }
  return msg;
}

/** Send one notification email; returns messageId on success. */
export async function sendEnquiryEmail(
  opts: EnquiryEmailOptions
): Promise<{ messageId?: string }> {
  const subject = opts.isViewingRequest
    ? `Viewing Request – ${opts.listingAddress}`
    : `New Enquiry – ${opts.listingAddress}`;

  const url = listingUrl(opts.listingId);
  const phoneRow = opts.enquirerPhone
    ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Phone</td><td style="padding:4px 8px;font-size:14px;">${escapeHtml(opts.enquirerPhone)}</td></tr>`
    : '';
  const sourceRow = opts.leadSource
    ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Source</td><td style="padding:4px 8px;font-size:14px;">${escapeHtml(opts.leadSource)}</td></tr>`
    : '';
  const noteBlock = opts.note
    ? `<p style="margin:0 0 16px;padding:12px 14px;background:#fff7ed;border:1px solid #ffedd5;border-radius:8px;font-size:13px;color:#9a3412;">${escapeHtml(opts.note)}</p>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488 0%,#0f766e 100%);padding:28px 32px">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">${escapeHtml(siteName)}</h1>
            <p style="margin:6px 0 0;color:#ccfbf1;font-size:14px">${opts.isViewingRequest ? 'You have a new viewing request' : 'You have a new property enquiry'}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 4px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Hi ${escapeHtml(opts.recipientName)},</p>
            ${noteBlock}
            <p style="margin:0 0 24px;font-size:16px;color:#111827">
              ${opts.isViewingRequest ? 'Someone has requested a viewing for' : 'You have received an enquiry about'}
              <strong><a href="${url}" style="color:#0d9488">${escapeHtml(opts.listingAddress)}</a></strong>.
            </p>
            <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6b7280">Contact Details</p>
              <table cellpadding="0" cellspacing="0" style="width:100%">
                <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;width:80px">Name</td><td style="padding:4px 8px;font-size:14px;font-weight:600">${escapeHtml(opts.enquirerName)}</td></tr>
                <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:4px 8px;font-size:14px;"><a href="mailto:${escapeHtml(opts.enquirerEmail)}" style="color:#0d9488">${escapeHtml(opts.enquirerEmail)}</a></td></tr>
                ${phoneRow}
                ${sourceRow}
              </table>
            </div>
            <div style="border-left:4px solid #0d9488;padding:16px 20px;background:#f0fdfa;border-radius:0 8px 8px 0;margin-bottom:24px">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#0f766e">Message</p>
              <p style="margin:0;font-size:15px;color:#1f2937;white-space:pre-wrap">${escapeHtml(opts.message)}</p>
            </div>
            <a href="mailto:${escapeHtml(opts.enquirerEmail)}?subject=Re: ${encodeURIComponent(opts.listingAddress)}"
               style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
              Reply to ${escapeHtml(opts.enquirerName)}
            </a>
            <p style="margin:20px 0 0;font-size:13px;color:#6b7280">
              Also view in admin: <a href="${siteUrl}/admin/leads" style="color:#0d9488">${siteUrl}/admin/leads</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e5e7eb;background:#f9fafb">
            <p style="margin:0;font-size:12px;color:#9ca3af">This email was sent by ${escapeHtml(siteName)}. Listing: <a href="${url}" style="color:#0d9488">${url}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: opts.to,
    replyTo: opts.enquirerEmail,
    subject,
    html,
  });
  return { messageId: info.messageId };
}

/** Admin inbox for listing enquiries (comma-separated allowed). */
export function getEnquiryNotifyEmails(): string[] {
  const raw = process.env.ENQUIRY_NOTIFY_EMAIL || process.env.EMAIL_ADMIN_INBOX || '';
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Review-queue notification (listing submit for approval, later marketing content, etc.).
 * Same admin inbox as enquiries (`ENQUIRY_NOTIFY_EMAIL` / `EMAIL_ADMIN_INBOX`).
 */
export type ReviewQueueKind = 'listing' | 'marketing';

export interface ReviewQueueEmailOptions {
  to: string | string[];
  kind: ReviewQueueKind;
  title: string;
  subtitle?: string;
  agentName?: string;
  listingType?: string;
  address?: string;
  reviewUrl: string;
  previewUrl?: string;
}

export async function sendReviewQueueEmail(
  opts: ReviewQueueEmailOptions
): Promise<{ messageId?: string }> {
  const kindLabel = opts.kind === 'marketing' ? 'Marketing content' : 'Listing';
  const subject =
    opts.kind === 'marketing'
      ? `Marketing awaiting review – ${opts.title}`
      : `Listing awaiting approval – ${opts.title}`;

  const rows: string[] = [];
  if (opts.agentName) {
    rows.push(
      `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;width:110px">Submitted by</td><td style="padding:4px 8px;font-size:14px;font-weight:600">${escapeHtml(opts.agentName)}</td></tr>`
    );
  }
  if (opts.listingType) {
    rows.push(
      `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Type</td><td style="padding:4px 8px;font-size:14px;">${escapeHtml(opts.listingType)}</td></tr>`
    );
  }
  if (opts.address) {
    rows.push(
      `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Address</td><td style="padding:4px 8px;font-size:14px;">${escapeHtml(opts.address)}</td></tr>`
    );
  }

  const previewBtn = opts.previewUrl
    ? `<a href="${escapeHtml(opts.previewUrl)}" style="display:inline-block;margin-left:10px;background:#ffffff;color:#0f766e;border:1px solid #99f6e4;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600">Preview</a>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr>
          <td style="background:linear-gradient(135deg,#d97706 0%,#b45309 100%);padding:28px 32px">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">${escapeHtml(siteName)}</h1>
            <p style="margin:6px 0 0;color:#fef3c7;font-size:14px">${escapeHtml(kindLabel)} ready for your review</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 8px;font-size:14px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Hi Admin,</p>
            <p style="margin:0 0 20px;font-size:16px;color:#111827;line-height:1.5">
              <strong>${escapeHtml(opts.title)}</strong>
              ${opts.subtitle ? `<br/><span style="font-size:14px;color:#6b7280">${escapeHtml(opts.subtitle)}</span>` : ''}
              needs review before it goes live.
            </p>
            ${
              rows.length
                ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;margin-bottom:24px"><table cellpadding="0" cellspacing="0" style="width:100%">${rows.join('')}</table></div>`
                : ''
            }
            <a href="${escapeHtml(opts.reviewUrl)}"
               style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600">
              Review &amp; publish
            </a>
            ${previewBtn}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e5e7eb;background:#f9fafb">
            <p style="margin:0;font-size:12px;color:#9ca3af">${escapeHtml(siteName)} admin review queue · <a href="${siteUrl}/admin/listings" style="color:#0d9488">All listings</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: opts.to,
    subject,
    html,
  });
  return { messageId: info.messageId };
}

export function getEmailFromAddress(): string {
  return fromEmail;
}

/** Returns true if SMTP is configured enough to attempt sending */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}
