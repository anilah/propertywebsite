import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

const INTENT_OPTIONS = [
  { value: 'quote', label: 'Get a quote' },
  { value: 'availability', label: 'Check availability' },
  { value: 'general', label: 'General enquiry' },
] as const;

export interface TradieEnquirePayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  intent: string;
}

interface Props {
  isOpen: boolean;
  businessName: string;
  sending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: TradieEnquirePayload) => void;
}

export function TradieEnquireModal({
  isOpen,
  businessName,
  sending,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [intent, setIntent] = useState('quote');
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setEmail('');
    setPhone('');
    setIntent('quote');
    setMessage('');
    setLocalError(null);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setLocalError('Name, email, and message are required');
      return;
    }
    setLocalError(null);
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: message.trim(),
      intent,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enquire · ${businessName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Send a message and {businessName} will get back to you. Your details stay private until
          they reply.
        </p>

        <div className="flex flex-wrap gap-2">
          {INTENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={sending}
              onClick={() => setIntent(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                intent === opt.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={sending}
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={sending}
          autoComplete="email"
        />
        <Input
          label="Phone (optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={sending}
          autoComplete="tel"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={sending}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Briefly describe the job…"
          />
        </div>

        {(localError || error) && (
          <p className="text-sm text-red-600" role="alert">
            {localError || error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send enquiry'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
