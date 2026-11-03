import type { ListingType } from '../types';

export type EnquiryStepId = 'intent' | 'timeline' | 'readiness' | 'contact';

export interface EnquiryChoice {
  value: string;
  label: string;
  emoji?: string;
}

export interface EnquiryAnswers {
  intent: string;
  timeline: string;
  readiness: string;
  name: string;
  email: string;
  phone: string;
}

export const EMPTY_ENQUIRY_ANSWERS: EnquiryAnswers = {
  intent: '',
  timeline: '',
  readiness: '',
  name: '',
  email: '',
  phone: '',
};

export const INTENT_OPTIONS: EnquiryChoice[] = [
  { value: 'private_viewing', label: 'Arrange a private viewing', emoji: '🏠' },
  { value: 'more_info', label: 'Get more property information', emoji: '📄' },
  { value: 'speak_agent', label: 'Speak with the agent', emoji: '💬' },
];

export const BUY_TIMELINE_OPTIONS: EnquiryChoice[] = [
  { value: 'immediately', label: 'Immediately' },
  { value: '1_3_months', label: 'Within 1–3 months' },
  { value: '3_6_months', label: 'Within 3–6 months' },
  { value: 'exploring', label: 'Just exploring' },
];

export const RENT_TIMELINE_OPTIONS: EnquiryChoice[] = [
  { value: 'asap', label: 'ASAP / this week' },
  { value: '2_4_weeks', label: 'Within 2–4 weeks' },
  { value: '1_3_months', label: 'Within 1–3 months' },
  { value: 'flexible', label: 'Flexible / just looking' },
];

export const BUY_READINESS_OPTIONS: EnquiryChoice[] = [
  { value: 'finance_approved', label: 'Finance approved / cash buyer', emoji: '💰' },
  { value: 'preapproval', label: 'Finance pre-approval in progress', emoji: '🏦' },
  { value: 'need_to_sell', label: 'Need to sell my property first', emoji: '🏠' },
  { value: 'not_sure', label: 'Not sure yet', emoji: '🧐' },
];

/** Rent / flatmates — never show purchase/finance questions */
export const RENT_READINESS_OPTIONS: EnquiryChoice[] = [
  { value: 'ready_now', label: 'Ready to move in now / bond ready', emoji: '✅' },
  { value: 'lease_ending', label: 'Current lease ending soon', emoji: '📅' },
  { value: 'references', label: 'Have references / rental history', emoji: '📋' },
  { value: 'just_looking', label: 'Just browsing for now', emoji: '👀' },
];

export function isSaleListing(listingType: ListingType): boolean {
  return listingType === 'SALE';
}

export function enquiryStepsFor(listingType: ListingType): EnquiryStepId[] {
  // Rent/flatmates skip “When do you need to move in?” (sale question #2).
  if (isSaleListing(listingType)) {
    return ['intent', 'timeline', 'readiness', 'contact'];
  }
  return ['intent', 'readiness', 'contact'];
}

export function timelineOptionsFor(listingType: ListingType): EnquiryChoice[] {
  return isSaleListing(listingType) ? BUY_TIMELINE_OPTIONS : RENT_TIMELINE_OPTIONS;
}

export function readinessOptionsFor(listingType: ListingType): EnquiryChoice[] {
  return isSaleListing(listingType) ? BUY_READINESS_OPTIONS : RENT_READINESS_OPTIONS;
}

export function timelineQuestionFor(listingType: ListingType): string {
  return isSaleListing(listingType)
    ? 'When are you looking to buy?'
    : 'When do you need to move in?';
}

export function readinessQuestionFor(listingType: ListingType): string {
  return isSaleListing(listingType)
    ? 'Are you currently in a position to purchase?'
    : 'What’s your rental situation?';
}

function labelOf(options: EnquiryChoice[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Build a clear agent-facing message from the stepped answers. */
export function buildEnquiryMessage(
  listingType: ListingType,
  answers: EnquiryAnswers,
  seenOn?: string
): string {
  const lines = [`What they want: ${labelOf(INTENT_OPTIONS, answers.intent)}`];
  if (isSaleListing(listingType) && answers.timeline) {
    lines.push(
      `Buying timeline: ${labelOf(timelineOptionsFor(listingType), answers.timeline)}`
    );
  } else if (!isSaleListing(listingType) && answers.timeline) {
    lines.push(
      `Move-in timing: ${labelOf(timelineOptionsFor(listingType), answers.timeline)}`
    );
  }
  lines.push(
    `${isSaleListing(listingType) ? 'Purchase readiness' : 'Rental situation'}: ${labelOf(
      readinessOptionsFor(listingType),
      answers.readiness
    )}`
  );
  if (seenOn) lines.push(`Came from: ${seenOn}`);
  return lines.join('\n');
}

export function isViewingIntent(intent: string): boolean {
  return intent === 'private_viewing';
}
