import type { Campaign } from '../services/api';
import { campaignApi } from '../services/api';

/** Stable user-facing phases — never mix “encoding / processing / finishing”. */
export type IgPublishPhase =
  | 'idle'
  | 'sending'
  | 'encoding'
  | 'live'
  | 'failed'
  | 'timed_out';

export type IgPublishStepId = 'sending' | 'encoding' | 'live';

export const IG_PUBLISH_STEPS: {
  id: IgPublishStepId;
  label: string;
  hint: string;
}[] = [
  {
    id: 'sending',
    label: 'Send Reel to Instagram',
    hint: 'Handing the video to Meta…',
  },
  {
    id: 'encoding',
    label: 'Meta prepares the Reel',
    hint: 'Video encoding usually takes 30–90 seconds',
  },
  {
    id: 'live',
    label: 'Live on Instagram',
    hint: 'Your Reel is published',
  },
];

export type IgPublishJob = {
  campaignId: string;
  phase: IgPublishPhase;
  /** 0–100 visual progress */
  percent: number;
  /** Attempt within encoding poll loop */
  attempt: number;
  maxAttempts: number;
  title: string;
  detail: string;
  error?: string;
  viewUrl?: string | null;
  campaign?: Campaign;
};

export function phaseFromServerStatus(
  status?: string,
  opts?: { activelyPublishing?: boolean; phase?: IgPublishPhase }
): IgPublishPhase {
  if (opts?.activelyPublishing && opts.phase && opts.phase !== 'idle') return opts.phase;
  if (status === 'published') return 'live';
  if (status === 'failed') return 'failed';
  if (status === 'pending') return 'encoding';
  return 'idle';
}

/** Single vocabulary for chips / badges (server state when not mid-job). */
export function instagramStatusLabel(status?: string, updatedAt?: string): string {
  if (status === 'published') return 'Live';
  if (status === 'failed') return 'Failed';
  if (status === 'pending') {
    const stale = !updatedAt || Date.now() - new Date(updatedAt).getTime() > 90_000;
    return stale ? 'Needs finish' : 'Encoding';
  }
  return 'Not posted';
}

export function stepState(
  stepId: IgPublishStepId,
  phase: IgPublishPhase
): 'done' | 'active' | 'todo' | 'error' {
  if (phase === 'failed' || phase === 'timed_out') {
    if (stepId === 'live') return 'todo';
    if (stepId === 'encoding' && (phase === 'timed_out' || phase === 'failed')) return 'error';
    if (stepId === 'sending' && phase === 'failed') return 'error';
  }
  const order: IgPublishStepId[] = ['sending', 'encoding', 'live'];
  const phaseStep: IgPublishStepId =
    phase === 'live' ? 'live' : phase === 'sending' ? 'sending' : phase === 'encoding' ? 'encoding' : 'sending';
  const si = order.indexOf(stepId);
  const pi = order.indexOf(phaseStep);
  if (phase === 'idle') return 'todo';
  if (phase === 'live') return si <= 2 ? (si < 2 ? 'done' : 'done') : 'todo';
  if (si < pi) return 'done';
  if (si === pi) return 'active';
  return 'todo';
}

function percentFor(phase: IgPublishPhase, attempt: number, maxAttempts: number): number {
  if (phase === 'live') return 100;
  if (phase === 'failed' || phase === 'timed_out') return Math.min(95, 20 + attempt * 4);
  if (phase === 'sending') return 12;
  // encoding: climb from ~25% toward ~90% while polling
  const enc = 25 + Math.round((attempt / Math.max(maxAttempts, 1)) * 65);
  return Math.min(92, enc);
}

export type RunInstagramPublishOpts = {
  forceFirst?: boolean;
  maxAttempts?: number;
  pollMs?: number;
  onUpdate?: (job: IgPublishJob) => void;
  /** Abort if returns true */
  shouldCancel?: () => boolean;
};

/**
 * Runs Instagram finalize with a predictable phase machine the UI can render.
 */
export async function runInstagramPublish(
  campaignId: string,
  opts: RunInstagramPublishOpts = {}
): Promise<IgPublishJob> {
  const maxAttempts = opts.maxAttempts ?? 15;
  const pollMs = opts.pollMs ?? 3500;

  const emit = (partial: Omit<IgPublishJob, 'campaignId'> & { campaignId?: string }): IgPublishJob => {
    const job: IgPublishJob = {
      campaignId,
      ...partial,
      percent: percentFor(partial.phase, partial.attempt, maxAttempts),
    };
    opts.onUpdate?.(job);
    return job;
  };

  let job = emit({
    phase: 'sending',
    attempt: 0,
    maxAttempts,
    percent: 12,
    title: 'Posting Reel to Instagram',
    detail: 'Sending your video to Meta…',
  });

  try {
    for (let i = 0; i < maxAttempts; i++) {
      if (opts.shouldCancel?.()) {
        return emit({
          phase: 'timed_out',
          attempt: i,
          maxAttempts,
          percent: job.percent,
          title: 'Posting paused',
          detail: 'You left this page before Instagram finished. Open the campaign and tap Finish Instagram.',
        });
      }

      const force = Boolean(opts.forceFirst && i === 0) || i === 0 || i === Math.floor(maxAttempts * 0.7);
      if (i === 0) {
        job = emit({
          phase: 'sending',
          attempt: i,
          maxAttempts,
          percent: 12,
          title: 'Posting Reel to Instagram',
          detail: 'Sending your video to Meta…',
        });
      } else {
        job = emit({
          phase: 'encoding',
          attempt: i,
          maxAttempts,
          percent: percentFor('encoding', i, maxAttempts),
          title: 'Meta is preparing your Reel',
          detail: `Encoding in progress — check ${i} of ${maxAttempts}. This is normal for video.`,
        });
      }

      const res = await campaignApi.finalizeInstagram(campaignId, { force });
      const status = res.instagram?.status;

      if (status === 'published') {
        return emit({
          phase: 'live',
          attempt: i,
          maxAttempts,
          percent: 100,
          title: 'Live on Instagram',
          detail: res.message || 'Your Reel is published.',
          viewUrl: res.instagram?.viewUrl,
          campaign: res.campaign,
        });
      }

      if (status === 'failed') {
        return emit({
          phase: 'failed',
          attempt: i,
          maxAttempts,
          percent: percentFor('failed', i, maxAttempts),
          title: 'Instagram publish failed',
          detail: res.instagram?.error || res.message || 'Meta rejected this Reel.',
          error: res.instagram?.error || res.message,
          campaign: res.campaign,
        });
      }

      // pending — stay on encoding
      job = emit({
        phase: 'encoding',
        attempt: i + 1,
        maxAttempts,
        percent: percentFor('encoding', i + 1, maxAttempts),
        title: 'Meta is preparing your Reel',
        detail: `Encoding in progress — check ${i + 1} of ${maxAttempts}. Please keep this open.`,
        campaign: res.campaign,
      });

      await new Promise((r) => setTimeout(r, pollMs));
    }

    return emit({
      phase: 'timed_out',
      attempt: maxAttempts,
      maxAttempts,
      percent: 90,
      title: 'Still encoding on Meta',
      detail:
        'Meta needs a bit longer. Tap Finish Instagram again — your Facebook post is already live.',
      campaign: job.campaign,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return emit({
      phase: 'failed',
      attempt: job.attempt,
      maxAttempts,
      percent: job.percent,
      title: 'Instagram publish failed',
      detail: message,
      error: message,
      campaign: job.campaign,
    });
  }
}
