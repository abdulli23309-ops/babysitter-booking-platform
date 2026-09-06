import styles from './toast.module.css';

const TYPE_LABELS = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

/**
 * Single toast item (Phase F2A).
 * Rendered by ToastContainer. `onDismiss` is stable from the context.
 */
export default function Toast({ toast, onDismiss }) {
  return (
    <div
      className={[styles.toast, styles[toast.type] || styles.info].join(' ')}
      role="status"
      aria-live="polite"
    >
      <span className={styles.message}>
        <strong>{TYPE_LABELS[toast.type] || 'Info'}: </strong>
        {toast.message}
      </span>
      <button
        type="button"
        className={styles.close}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
