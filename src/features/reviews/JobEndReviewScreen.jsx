import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import { apiPost } from '../../services/apiClient';
import styles from './review-screen.module.css';

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

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '4h 15m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export default function JobEndReviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();
  const toast = useToast();

  const { job, elapsedSeconds, sitterId: passedSitterId } = location.state || {};

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sitterId = passedSitterId ?? job?.AssignedSitter_ID ?? job?.sitter?.id ?? null;
  const isSitterDeactivated = job?.IsSitterDeleted || (!job?.SitterName && !sitterId);
  const sitterName = isSitterDeactivated
    ? 'Deactivated Caregiver'
    : (job?.SitterName ?? job?.sitter?.name ?? 'Assigned Babysitter');
  const sitterPic = job?.SitterPicture ?? job?.sitter?.picture ?? null;
  const durationStr = formatDuration(elapsedSeconds);
  const payment = job?.Payment ?? (job?.HourlyRate ? job.HourlyRate * 4 : 8000);
  const startTime = job?.StartTime ? job.StartTime.substring(0, 5) : '06:00 PM';
  const endTime = job?.EndTime ? job.EndTime.substring(0, 5) : '10:15 PM';

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning('Please select a star rating.');
      return;
    }
    if (!sitterId) {
      toast.error('Caregiver information is unavailable for deactivated accounts.');
      return;
    }

    setSubmitting(true);
    try {
      await apiPost('/review/add', {
        Job_ID: job?.Job_ID,
        Reviewer_ID: userId,
        ReviewerRole: 'Parent',
        ReviewFor_ID: sitterId,
        ReviewForRole: 'Sitter',
        Rating: rating,
        Comment: comment.trim() || 'Great babysitting service!',
      });

      toast.success('Thank you! Your review has been published.');
      navigate('/my-jobs');
    } catch (err) {
      toast.error(err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className={styles.reviewContainer}>
        <div className={styles.topBar}>
          <BackButton onClick={() => navigate('/my-jobs')} />
          <h1 className={styles.pageTitle}>Review</h1>
          <div style={{ width: 42 }} />
        </div>
        <EmptyState
          title="No Session to Review"
          description="We could not find the completed job details."
          actionLabel="Go to My Bookings"
          onAction={() => navigate('/my-jobs')}
        />
        <ParentBottomNav />
      </div>
    );
  }

  return (
    <div className={styles.reviewContainer}>
      {/* Top Bar with Universal BackButton */}
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <BackButton onClick={() => navigate('/my-jobs')} />
          <h1 className={styles.pageTitle}>Job Summary</h1>
        </div>
      </header>

      {/* Hero Completion Check (Mockup Frame 9) */}
      <section className={styles.completionHero}>
        <div className={styles.successCheckCircle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className={styles.heroHeading}>Job Completed</h2>
        <p className={styles.heroSubtitle}>Great job! Here is your summary.</p>
      </section>

      {/* Bento Grid: Total Earnings / Cost & Duration (Mockup Frame 9) */}
      <div className={styles.bentoGrid}>
        <div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <span>💵</span>
            <span>Total Earnings</span>
          </div>
          <div className={styles.bentoValue}>PKR {payment.toLocaleString()}</div>
          <div className={styles.bentoSubtext}>Standard session rate</div>
        </div>

        <div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <span>⏱️</span>
            <span>Duration</span>
          </div>
          <div className={styles.bentoValue}>{durationStr}</div>
          <div className={styles.bentoSubtext}>Active session time</div>
        </div>
      </div>

      {/* Time Capsule Strip */}
      <div className={styles.timeCapsule}>
        <span>Start: {startTime}</span>
        <span className={styles.timeCapsuleDivider}>|</span>
        <span>End: {endTime}</span>
      </div>

      {/* Sitter Caregiver Card */}
      <section className={styles.sitterCard}>
        <img
          src={buildImageUrl(sitterPic)}
          alt={sitterName}
          className={styles.avatarCircle}
          onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=47'; }}
        />
        <div className={styles.sitterInfo}>
          <h3 className={styles.sitterName}>
            {sitterName}
            {isSitterDeactivated && (
              <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px', fontWeight: 'normal' }}>
                (Inactive)
              </span>
            )}
          </h3>
          <p className={styles.sitterRole}>Verified Babysitter</p>
        </div>
      </section>

      {/* Star Rating Picker */}
      <section className={styles.ratingPickerCard}>
        <h3 className={styles.promptTitle}>How was your care experience?</h3>
        <div className={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= rating;
            return (
              <button
                key={star}
                type="button"
                className={`${styles.starBtn} ${isFilled ? styles.starBtnActive : ''}`}
                onClick={() => setRating(star)}
                aria-label={`${star} star`}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill={isFilled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            );
          })}
        </div>
      </section>

      {/* Feedback Textarea */}
      <section className={styles.feedbackCard}>
        <label className={styles.feedbackLabel} htmlFor="review-feedback-input">
          Share Your Feedback (Optional)
        </label>
        <textarea
          id="review-feedback-input"
          className={styles.feedbackInput}
          rows={3}
          placeholder="Describe punctuality, attentiveness, and how your child liked the sitter..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </section>

      {/* Submit Review CTA Button */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        <button
          type="button"
          className={styles.submitBtn}
          disabled={submitting || (isSitterDeactivated && !sitterId)}
          onClick={handleSubmit}
        >
          <span>{submitting ? 'Submitting...' : isSitterDeactivated && !sitterId ? 'Caregiver Deactivated' : 'Submit Review'}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <ParentBottomNav />
    </div>
  );
}

