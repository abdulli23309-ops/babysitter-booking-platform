import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/ToastContext';
import styles from './job-tracking.module.css';

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

export default function ParentUpcomingJobScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const job = location.state?.job;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!job) {
    return (
      <div className={styles.trackingContainer}>
        <EmptyState
          title="Upcoming Session Not Found"
          description="Could not locate scheduled booking details."
          actionLabel="Go to My Bookings"
          onAction={() => navigate('/my-jobs')}
        />
        <ParentBottomNav />
      </div>
    );
  }

  const isSitterDeactivated = job.IsSitterDeleted || (!job.SitterName && !job.AssignedSitter_ID);
  const sitterName = isSitterDeactivated
    ? 'Deactivated Caregiver'
    : (job.SitterName ?? job.sitter?.name ?? 'Assigned Caregiver');
  const sitterPic = job.SitterPicture ?? job.sitter?.picture ?? null;
  const childName = job.ChildName ?? job.child?.name ?? 'Child';
  const locationText = job.City ?? job.city ?? 'Islamabad';
  const paymentRate = job.Payment ?? job.payment ?? 500;
  const dateStr = job.JobDate
    ? new Date(job.JobDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : 'Scheduled Date';
  const timeRange = job.SlotTimes?.length
    ? `${job.SlotTimes[0].StartTime?.substring(0, 5)} - ${job.SlotTimes[job.SlotTimes.length - 1].EndTime?.substring(0, 5)}`
    : 'Standard Schedule';

  const handleStartSession = async () => {
    try {
      const res = await fetch(`/api/jobs/updateStatus/${job.Job_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'In Progress' }),
      });
      if (res.ok) {
        toast.success('Babysitting session started!');
        navigate('/parent-active-job', { state: { job: { ...job, Status: 'In Progress' } } });
      } else {
        toast.error('Could not initiate session yet. Check schedule window.');
      }
    } catch {
      toast.error('Connection error.');
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/jobs/updateStatus/${job.Job_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Cancelled' }),
      });
      if (res.ok) {
        toast.info('Booking has been cancelled.');
        navigate('/my-jobs');
      } else {
        toast.error('Failed to cancel booking.');
      }
    } catch {
      toast.error('Server error.');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  return (
    <div className={styles.trackingContainer}>
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
        <h1 className={styles.pageTitle}>Upcoming Booking</h1>
        <div style={{ width: 40 }} />
        <div style={{ width: 42 }} />
      </div>

      {/* Sitter Banner */}
      <div className={styles.sitterBannerCard}>
        <img
          src={buildImageUrl(sitterPic)}
          alt={sitterName}
          className={styles.sitterAvatar}
          onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=47'; }}
        />
        <div className={styles.sitterBannerText}>
          <h2 className={styles.sitterName}>{sitterName}</h2>
          <span className={styles.sitterIdText}>📍 {locationText}</span>
        </div>
        <span className={styles.childBadge}>
          👶 {childName}
        </span>
      </div>

      {/* Schedule Info Card */}
      <section style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--badge-info-bg)',
            color: 'var(--badge-info-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Scheduled Date</span>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>{dateStr}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--badge-purple-bg)',
            color: 'var(--badge-purple-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Care Hours</span>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>{timeRange}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Agreed Rate</span>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>PKR {paymentRate}/hr</p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {!isSitterDeactivated && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleStartSession}
          >
            Start Session Now
          </Button>
        )}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setShowCancelModal(true)}
        >
          Cancel Booking
        </Button>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !cancelling && setShowCancelModal(false)}
        title="Cancel Upcoming Booking?"
      >
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to cancel this booking scheduled with {sitterName}? This will notify the caregiver.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" fullWidth disabled={cancelling} onClick={() => setShowCancelModal(false)}>
            Keep Booking
          </Button>
          <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancelBooking}>
            Yes, Cancel
          </Button>
        </div>
      </Modal>

      <ParentBottomNav />
    </div>
  );
}
