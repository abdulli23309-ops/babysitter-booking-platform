import styles from './card.module.css';

/**
 * Shared Card (Phase F2 — infrastructure only).
 * Not yet applied to existing pages (deferred to F3/F4).
 */
export default function Card({
  padding = 'md',
  className,
  children,
  ...rest
}) {
  const classes = [
    styles.card,
    styles[`pad-${padding}`] || styles['pad-md'],
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
