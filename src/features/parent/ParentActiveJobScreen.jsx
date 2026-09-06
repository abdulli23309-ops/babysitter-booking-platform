import { useState, useEffect } from 'react';
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

const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export default function ParentActiveJobScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const job = location.state?.job;

  const [childAge, setChildAge] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!job?.Child_ID) return;
    let ignore = false;
    const fetchChild = async () => {
      try {
        const parentId = job.Parent_ID || job.ParentId || localStorage.getItem('userId');
        if (!parentId) return;
        const res = await fetch(`/api/parent/children/${parentId}`);
        if (res.ok && !ignore) {
          const children = await res.json();
          const childData = Array.isArray(children) ? children.find(c => c.Child_ID === job.Child_ID) : null;
          if (childData?.DOB) {
            setChildAge(calculateAge(childData.DOB));
          }
        }
      } catch (err) {
        console.error('Could not fetch child details', err);
      }
    };
    fetchChild();
    return () => {
      ignore = true;
    };
  }, [job]);

  useEffect(() => {
    if (!job?.SlotTimes || job.SlotTimes.length === 0) return;
    const startTimeStr = job.SlotTimes[0].StartTime;
    if (!startTimeStr) return;
    const [hours, minutes] = startTimeStr.split(':');
    const start = new Date(job.JobDate || Date.now());
    start.setHours(Number(hours), Number(minutes), 0, 0);

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
      setElapsedSeconds(diff);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [job]);

  const handleEndJob = async () => {
    if (!job?.Job_ID) return;
    setEnding(true);
    try {
      const res = await fetch(`/api/jobs/updateStatus/${job.Job_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Completed' }),
      });
      if (res.ok) {
        toast.success('Babysitting session completed!');
        navigate('/job-end-review', {
          state: {
            job,
            elapsedSeconds,
            sitterId: job.AssignedSitter_ID ?? job.sitter?.id,
            childAge,
          },
        });
      } else {
        toast.error('Failed to end job. Please try again.');
      }
    } catch {
      toast.error('Server connection failed.');
    } finally {
      setEnding(false);
      setShowEndConfirm(false);
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!job) {
    return (
      <div className={styles.trackingContainer}>
        <EmptyState
          title="No Active Job"
          description="We could not find active session details."
          actionLabel="Go to My Jobs"
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
  const phone = job.SitterPhone ?? job.sitter?.phone ?? null;

  return (
    <div className={styles.trackingContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Live Session</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Sitter Banner */}
      <div className={styles.sitterBannerCard}>
        <img
          src={buildImageUrl(sitterPic)}
          alt={sitterName}
          className={styles.sitterAvatar}
          onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=32'; }}
        />
        <div className={styles.sitterBannerText}>
          <h2 className={styles.sitterName}>{sitterName}</h2>
          <span className={styles.sitterIdText}>📍 {locationText}</span>
        </div>
        <span className={styles.childBadge}>
          👶 {childName}{childAge !== null ? ` (${childAge}y)` : ''}
        </span>
      </div>

      {/* Live Timer Hero */}
      <section className={styles.timerCard}>
        <div className={styles.timerGlow} />
        <span className={styles.liveBadge}>
          <span className={styles.pulsingDot} />
          SESSION IN PROGRESS
        </span>
        <div className={styles.timerDigits}>
          {formatTime(elapsedSeconds)}
        </div>
        <p className={styles.timerSub}>Elapsed Care Duration</p>
      </section>

      {/* Quick Action Grid */}
      <div className={styles.actionGrid}>
        {phone ? (
          <a href={`tel:${phone}`} className={styles.actionBtn}>
            <div className={styles.actionIcon} style={{ background: 'var(--badge-success-bg)', color: 'var(--badge-success-text)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <div>Call Sitter</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Emergency</div>
            </div>
          </a>
        ) : (
          <button
            type="button"
            className={styles.actionBtn}
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
            onClick={() => toast.warning('Caregiver phone number is unavailable.')}
          >
            <div className={styles.actionIcon} style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <div>No Phone</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Unavailable</div>
            </div>
          </button>
        )}

        <div
          className={styles.actionBtn}
          onClick={() => navigate('/baby-monitoring')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/baby-monitoring')}
        >
          <div className={styles.actionIcon} style={{ background: 'var(--badge-info-bg)', color: 'var(--badge-info-text)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div>
            <div>Live Camera</div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>HD Feed</div>
          </div>
        </div>
      </div>

      {/* Rate & Info Card */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Rate per Hour</span>
          <p style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text)' }}>
            PKR {paymentRate}/hr
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
          <p style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700, color: '#16A34A' }}>
            Active Duty
          </p>
        </div>
      </div>

      {/* End Job Primary Action */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onClick={() => setShowEndConfirm(true)}
        >
          End Babysitting Session
        </Button>
      </div>

      {/* End Confirmation Modal */}
      <Modal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        title="Confirm Session Completion"
      >
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to end this active session with {sitterName}? This will finalize the service time and take you to the review screen.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" fullWidth onClick={() => setShowEndConfirm(false)}>
            Stay Active
          </Button>
          <Button variant="danger" fullWidth loading={ending} onClick={handleEndJob}>
            End & Review
          </Button>
        </div>
      </Modal>

      <ParentBottomNav />
    </div>
  );
}

