import { useEffect, useMemo, useState } from 'react';
import type { ListingType } from '../../types';
import { Modal } from '../ui/Modal';
import {
  EMPTY_ENQUIRY_ANSWERS,
  INTENT_OPTIONS,
  buildEnquiryMessage,
  enquiryStepsFor,
  readinessOptionsFor,
  readinessQuestionFor,
  timelineOptionsFor,
  timelineQuestionFor,
  type EnquiryAnswers,
  type EnquiryChoice,
  type EnquiryStepId,
} from '../../utils/enquiryForm';

interface Props {
  isOpen: boolean;
  listingType: ListingType;
  sending: boolean;
  error: string | null;
  /** Optional “Facebook” / “Instagram” label when the visitor arrived from a tracked post */
  seenOn?: string;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    intent: string;
  }) => void;
}

function ChoiceList({
  options,
  value,
  disabled,
  onSelect,
}: {
  options: EnquiryChoice[];
  value: string;
  disabled?: boolean;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition disabled:opacity-60 ${
              selected
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/25'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
            }`}
          >
            {opt.emoji && <span className="text-lg leading-none shrink-0" aria-hidden>{opt.emoji}</span>}
            <span className={`min-w-0 flex-1 text-sm font-medium ${selected ? 'text-primary-900' : 'text-slate-800'}`}>
              {opt.label}
            </span>
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                selected ? 'border-primary-600 bg-primary-600' : 'border-slate-300 bg-white'
              }`}
              aria-hidden
            >
              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function EnquiryFormModal({
  isOpen,
  listingType,
  sending,
  error,
  seenOn,
  onClose,
  onSubmit,
}: Props) {
  const steps = useMemo(() => enquiryStepsFor(listingType), [listingType]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<EnquiryAnswers>(EMPTY_ENQUIRY_ANSWERS);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
    setAnswers(EMPTY_ENQUIRY_ANSWERS);
    setLocalError(null);
  }, [isOpen, listingType]);

  const step: EnquiryStepId = steps[stepIndex] ?? 'contact';
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const displayError = localError || error;
  const isContactStep = step === 'contact';

  const setField = <K extends keyof EnquiryAnswers>(key: K, value: EnquiryAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setLocalError(null);
  };

  /** Choice steps: select + advance immediately (Meta-style). */
  const selectAndAdvance = (field: 'intent' | 'timeline' | 'readiness', value: string) => {
    if (sending) return;
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setLocalError(null);
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const handleSubmit = () => {
    if (!answers.name.trim() || !answers.email.trim()) {
      setLocalError('Please enter your full name and email.');
      return;
    }
    onSubmit({
      name: answers.name.trim(),
      email: answers.email.trim(),
      phone: answers.phone.trim() || undefined,
      message: buildEnquiryMessage(listingType, answers, seenOn),
      intent: answers.intent,
    });
  };

  const handleBack = () => {
    if (sending || stepIndex === 0) return;
    setLocalError(null);
    setStepIndex((i) => i - 1);
  };

  const stepTitle =
    step === 'intent'
      ? 'What would you like to do?'
      : step === 'timeline'
        ? timelineQuestionFor(listingType)
        : step === 'readiness'
          ? readinessQuestionFor(listingType)
          : 'Contact information';

  return (
    <Modal
      isOpen={isOpen}
      closeOnBackdrop={false}
      onClose={() => {
        if (sending) return;
        onClose();
      }}
      title={stepTitle}
      footer={
        <div className="w-full space-y-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Step {stepIndex + 1} of {steps.length}
            </span>
            {/* Only Back — forward is by tapping an option (or Submit on contact) */}
            <button
              type="button"
              onClick={handleBack}
              disabled={stepIndex === 0 || sending}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-30 hover:bg-slate-50"
              aria-label="Back"
            >
              ← Back
            </button>
          </div>
          {isContactStep && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending}
              className="w-full rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send enquiry'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (sending) return;
              onClose();
            }}
            disabled={sending}
            className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {displayError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {displayError}
          </div>
        )}

        {step === 'intent' && (
          <ChoiceList
            options={INTENT_OPTIONS}
            value={answers.intent}
            disabled={sending}
            onSelect={(v) => selectAndAdvance('intent', v)}
          />
        )}

        {step === 'timeline' && (
          <ChoiceList
            options={timelineOptionsFor(listingType)}
            value={answers.timeline}
            disabled={sending}
            onSelect={(v) => selectAndAdvance('timeline', v)}
          />
        )}

        {step === 'readiness' && (
          <ChoiceList
            options={readinessOptionsFor(listingType)}
            value={answers.readiness}
            disabled={sending}
            onSelect={(v) => selectAndAdvance('readiness', v)}
          />
        )}

        {step === 'contact' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">
              Property listing agent will be using this information to contact you
            </p>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={answers.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="Enter your answer"
                className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-0"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full name
              </span>
              <input
                type="text"
                required
                autoComplete="name"
                value={answers.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Enter your answer"
                className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-0"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone number
              </span>
              <input
                type="tel"
                autoComplete="tel"
                value={answers.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Enter your answer"
                className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-0"
              />
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
}
