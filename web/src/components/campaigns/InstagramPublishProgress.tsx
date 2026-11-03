import {
  IG_PUBLISH_STEPS,
  stepState,
  type IgPublishJob,
  type IgPublishPhase,
} from '../../utils/instagramPublishProgress';

function phaseTone(phase: IgPublishPhase): string {
  switch (phase) {
    case 'live':
      return 'border-emerald-200 bg-emerald-50';
    case 'failed':
    case 'timed_out':
      return 'border-red-200 bg-red-50';
    default:
      return 'border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50';
  }
}

/**
 * Step-based Instagram Reel publish progress — stays visible for the whole job.
 */
export function InstagramPublishProgress({
  job,
  onRetry,
  onDismiss,
  compact,
}: {
  job: IgPublishJob;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}) {
  const busy = job.phase === 'sending' || job.phase === 'encoding';
  const done = job.phase === 'live';
  const failed = job.phase === 'failed' || job.phase === 'timed_out';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-2xl border ${phaseTone(job.phase)} ${compact ? 'p-3' : 'p-4 sm:p-5'} shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-800/70">
            Instagram Reel
          </p>
          <p className={`font-semibold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {job.title}
          </p>
          <p className={`mt-0.5 text-slate-600 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
            {job.detail}
          </p>
        </div>
        {busy && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/80 border border-fuchsia-100">
            <span className="h-4 w-4 rounded-full border-2 border-fuchsia-500 border-t-transparent animate-spin" />
          </span>
        )}
        {done && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            ✓
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 rounded-full bg-white/80 overflow-hidden border border-black/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            failed ? 'bg-red-500' : done ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'
          }`}
          style={{ width: `${Math.max(4, job.percent)}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] font-medium text-slate-500 tabular-nums">
        {busy
          ? `${job.percent}% · step ${Math.min(job.attempt + 1, job.maxAttempts)} of ${job.maxAttempts}`
          : done
            ? '100% complete'
            : failed
              ? 'Stopped'
              : `${job.percent}%`}
      </p>

      {/* Steps */}
      {!compact && (
        <ol className="mt-4 space-y-2.5">
          {IG_PUBLISH_STEPS.map((step) => {
            const state = stepState(step.id, job.phase);
            return (
              <li key={step.id} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    state === 'done'
                      ? 'bg-emerald-500 text-white'
                      : state === 'active'
                        ? 'bg-fuchsia-600 text-white animate-pulse'
                        : state === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {state === 'done' ? '✓' : state === 'error' ? '!' : state === 'active' ? '…' : ''}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      state === 'active'
                        ? 'text-fuchsia-900'
                        : state === 'done'
                          ? 'text-emerald-800'
                          : state === 'error'
                            ? 'text-red-800'
                            : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {(failed || done) && (
        <div className={`mt-4 flex flex-wrap gap-2 ${compact ? '' : ''}`}>
          {failed && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95"
            >
              Try again
            </button>
          )}
          {done && job.viewUrl && (
            <a
              href={job.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              Open Instagram ↗
            </a>
          )}
          {onDismiss && (done || failed) && (
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Fixed overlay while a publish job is running (list + detail). */
export function InstagramPublishOverlay({
  job,
  onRetry,
  onDismiss,
}: {
  job: IgPublishJob | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  if (!job || job.phase === 'idle') return null;
  const busy = job.phase === 'sending' || job.phase === 'encoding';

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[85] sm:w-[24rem]">
      <InstagramPublishProgress
        job={job}
        onRetry={busy ? undefined : onRetry}
        onDismiss={busy ? undefined : onDismiss}
      />
    </div>
  );
}
