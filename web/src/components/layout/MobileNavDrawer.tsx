/**
 * Full-screen mobile navigation drawer for public + admin chrome.
 * Presentation only — same routes / auth as desktop Header.
 */
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export type MobileNavItem = {
  to: string;
  label: string;
  active?: boolean;
  icon?: React.ReactNode;
  badge?: number;
};

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  items: MobileNavItem[];
  footer?: React.ReactNode;
}

export function MobileNavDrawer({ open, onClose, title, items, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-[min(100%,20rem)] bg-white shadow-2xl flex flex-col animate-slide-in pt-safe">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-touch min-w-touch inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {items.map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              onClick={onClose}
              aria-current={item.active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                item.active
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon && <span className={item.active ? 'text-white' : 'text-gray-400'}>{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span
                  className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    item.active ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        {footer && (
          <div className="border-t border-gray-100 px-3 py-3 pb-safe">{footer}</div>
        )}
      </div>
    </div>
  );
}
