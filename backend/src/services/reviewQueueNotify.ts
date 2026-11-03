/**
 * Notify super admins when something enters the review queue.
 * Used for listing submit-for-approval today; kind allows marketing later.
 */
import prisma from '../config/database.js';
import {
  getEnquiryNotifyEmails,
  isEmailConfigured,
  sendReviewQueueEmail,
  type ReviewQueueKind,
} from './email.js';

const siteUrl = (process.env.SITE_URL || 'https://kaboohomes.com').replace(/\/$/, '');

export async function resolveAdminNotifyEmails(): Promise<string[]> {
  const fromEnv = getEnquiryNotifyEmails().map((e) => e.toLowerCase());
  const set = new Set<string>(fromEnv);
  if (set.size === 0) {
    const admins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true },
      select: { email: true },
      take: 20,
    });
    for (const a of admins) {
      if (a.email?.trim()) set.add(a.email.trim().toLowerCase());
    }
  }
  return [...set];
}

export interface ListingReviewNotifyInput {
  listingId: string;
  headline: string;
  listingType: string;
  streetAddress?: string | null;
  suburb?: string | null;
  city?: string | null;
  agentName?: string | null;
}

/** Fire-and-forget safe: logs errors, never throws to the request path. */
export async function notifyListingAwaitingApproval(input: ListingReviewNotifyInput): Promise<void> {
  await notifyReviewQueue({
    kind: 'listing',
    title: input.headline || 'Untitled listing',
    subtitle: 'An agent submitted this property for approval.',
    agentName: input.agentName || undefined,
    listingType: input.listingType,
    address: [input.streetAddress, input.suburb, input.city].filter(Boolean).join(', ') || undefined,
    reviewUrl: `${siteUrl}/admin/listings/${input.listingId}/edit`,
    previewUrl: `${siteUrl}/listing/${input.listingId}`,
  });
}

export async function notifyReviewQueue(opts: {
  kind: ReviewQueueKind;
  title: string;
  subtitle?: string;
  agentName?: string;
  listingType?: string;
  address?: string;
  reviewUrl: string;
  previewUrl?: string;
}): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn(`[review-queue] SMTP not configured — skipped ${opts.kind} notify for "${opts.title}"`);
      return;
    }
    const to = await resolveAdminNotifyEmails();
    if (to.length === 0) {
      console.warn(`[review-queue] No admin emails configured — skipped ${opts.kind} notify`);
      return;
    }
    const r = await sendReviewQueueEmail({ ...opts, to });
    console.log(`[review-queue] emailed admins for ${opts.kind}: ${to.join(', ')} id=${r.messageId ?? '?'}`);
  } catch (err) {
    console.error(`[review-queue] failed to notify for ${opts.kind}:`, err);
  }
}
