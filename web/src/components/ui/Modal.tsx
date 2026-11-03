import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  /**
   * If false, only the X / footer Cancel close the modal.
   * Use for forms so focus, keyboard, and accidental outside taps don’t wipe input.
   */
  closeOnBackdrop?: boolean;
}

/**
 * Stable centered modal — backdrop click is optional; panel clicks never dismiss.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnBackdrop = true,
}: ModalProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'app-modal-title' : undefined}
    >
      {/* Backdrop — only this layer dismisses (when enabled) */}
      <div
        className="absolute inset-0 bg-gray-900/75 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeOnBackdrop ? () => onCloseRef.current() : undefined}
      />

      {/* Panel — isolated from backdrop clicks */}
      <div
        className="relative z-10 w-full sm:max-w-lg max-h-[min(92dvh,920px)] overflow-y-auto overscroll-contain rounded-t-2xl sm:rounded-2xl bg-white text-left shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between gap-3">
              <h3 id="app-modal-title" className="text-xl font-bold text-gray-900">
                {title}
              </h3>
              <button
                type="button"
                onClick={() => onCloseRef.current()}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg shrink-0"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="px-6 py-6">{children}</div>

        {footer && (
          <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col-reverse sm:flex-row sm:flex-wrap justify-end gap-2 sm:gap-3 rounded-b-2xl [&:has(>.w-full)]:flex-col [&:has(>.w-full)]:sm:flex-col">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
