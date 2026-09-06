import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import styles from './sitter-details.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

export default function BabySitterDetails2() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;

  if (!job) {
    return (
      <div className={styles.detailsContainer}>
        <EmptyState
          title="Session Details Not Found"
          description="Could not locate historical booking data."
          actionLabel="Go to My Bookings"
          onAction={() => navigate('/my-jobs')}
        />
        <ParentBottomNav />
      </div>
    );
  }

  // Phase F-B6 Defensive Coalescing for completed job sitter
  const isSitterDeactivated = job.IsSitterDeleted || (!job.SitterName && !job.AssignedSitter_ID);
  const sitterName = isSitterDeactivated
    ? 'Deactivated Caregiver'
    : (job.SitterName ?? job.sitter?.name ?? 'Assigned Caregiver');
  const sitterPic = job.SitterPicture ?? job.sitter?.picture ?? null;
  const childName = job.ChildName ?? job.child?.name ?? 'Child';
  const dateStr = job.JobDate
    ? new Date(job.JobDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Completed Date';
  const payment = job.Payment ?? job.payment ?? 500;
  const status = job.Status ?? 'Completed';

  return (
    <div className={styles.detailsContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/my-jobs')}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <BackButton onClick={() => navigate('/my-jobs')} />
        <h1 className={styles.pageTitle}>Booking Summary</h1>
        <div style={{ width: 40 }} />
        <div style={{ width: 42 }} />
      </div>

      {/* Sitter Hero Banner */}
      <section className={styles.heroSection}>
        <div className={styles.avatarWrap}>
          <img
            src={buildImageUrl(sitterPic)}
            alt={sitterName}
            className={styles.avatarImg}
            onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=47'; }}
          />
        </div>
        <h2 className={styles.sitterName}>
          {sitterName}
          {isSitterDeactivated && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 'normal' }}>
              (Caregiver Inactive)
            </span>
          )}
        </h2>
        <div className={styles.verifiedBadge} style={{ background: 'var(--badge-success-bg)', color: 'var(--badge-success-text)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Service Status: {status}</span>
        </div>
      </section>

      {/* Summary Card */}
      <section className={styles.bioCard}>
        <h3 className={styles.sectionTitle}>Session Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Child Supervised</span>
            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{childName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Date of Service</span>
            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{dateStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Hourly Compensation</span>
            <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>PKR {payment}/hr</span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {!isSitterDeactivated && status === 'Completed' && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/job-end-review', { state: { job, sitterId: job.AssignedSitter_ID } })}
          >
            Leave a Rating & Review
          </Button>
        )}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => navigate('/my-jobs')}
        >
          Return to My Bookings
        </Button>
      </div>

      <ParentBottomNav />
    </div>
  );
}
