import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Single OK button — for success/error notices (replaces window.alert). */
  alertOnly?: boolean;
  variant?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * App-themed confirmation (replaces window.confirm / window.alert).
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  alertOnly = false,
  variant = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => undefined : onCancel}
      title={title}
      footer={
        alertOnly ? (
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
            className={
              variant === 'primary' && !busy
                ? 'bg-green-600 hover:bg-green-700 border-green-600'
                : undefined
            }
          >
            {confirmLabel === 'Confirm' ? 'OK' : confirmLabel}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              {cancelLabel}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              disabled={busy}
              className={
                variant === 'primary' && !busy
                  ? 'bg-green-600 hover:bg-green-700 border-green-600'
                  : undefined
              }
            >
              {busy ? 'Working…' : confirmLabel}
            </Button>
          </>
        )
      }
    >
      <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{message}</p>
    </Modal>
  );
}
