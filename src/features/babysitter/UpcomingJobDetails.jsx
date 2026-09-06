import { useNavigate, useLocation } from 'react-router-dom';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import styles from './upcoming-job-details.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

const formatTime12 = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute || 0).padStart(2, '0')} ${period}`;
};

export default function UpcomingJobDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve job from state, or use default mockup aligned with Image 1 & 4
  const job = location.state?.job || {
    Job_ID: 102,
    ParentName: 'Farhan Raza',
    ParentRating: 4.8,
    ParentPic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    JobDate: '2026-03-20',
    City: 'G8/1, Islamabad',
    Payment: 3150,
    Status: 'Waiting for Parent',
    SlotTimes: [
      { StartTime: '17:00:00', EndTime: '21:00:00' }
    ]
  };

  const isConfirmed = job.Status === 'Confirmed' || job.Status === 'In Progress';
  const parentName = job.ParentName || 'Farhan Raza';
  const parentRating = Number(job.ParentRating ?? 4.8).toFixed(1);
  const parentPic = buildImageUrl(job.ParentPic);

  const formattedDate = job.JobDate
    ? new Date(job.JobDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '20 March 2026';

  let timeRange = '05:00 PM – 09:00 PM';
  if (job.SlotTimes && job.SlotTimes.length > 0) {
    const start = job.SlotTimes[0].StartTime?.substring(0, 5);
    const end = job.SlotTimes[job.SlotTimes.length - 1].EndTime?.substring(0, 5);
    timeRange = `${formatTime12(start)} – ${formatTime12(end)}`;
  }

  const locationText = job.City || job.ParentAddress || 'G8/1, Islamabad';
  const earningsText = `PKR ${job.Payment || 3150}`;

  return (
    <div className={styles.container}>
      {/* Universal Top Header */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Job Details</h1>
      </div>

      {/* Status Banner */}
      <div className={styles.statusBannerCard}>
        <div className={isConfirmed ? styles.statusPillConfirmed : styles.statusPillPending}>
          {isConfirmed ? (
            <>
              <span>✓</span>
              <span>JOB CONFIRMED</span>
            </>
          ) : (
            <>
              <span>⏳</span>
              <span>WAITING FOR CONFIRMATION</span>
            </>
          )}
        </div>
        <p className={styles.bannerSubtext}>
          {isConfirmed
            ? 'You have been assigned to this job.'
            : 'Your proposal has been sent to the parent.'}
        </p>
      </div>

      {/* Parent Card */}
      <div className={styles.parentCard}>
        <div className={styles.parentHeaderRow}>
          <img
            src={parentPic}
            alt={parentName}
            className={styles.parentAvatar}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
            }}
          />
          <div className={styles.parentMeta}>
            <h2 className={styles.parentName}>{parentName}</h2>
            <div className={styles.ratingRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{parentRating} star rating</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/babysitter-notifications')}
          className={styles.messageBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Message Parent
        </button>
      </div>

      {/* Details List Card */}
      <div className={styles.detailsCard}>
        {/* Date Row */}
        <div className={styles.detailRow}>
          <div className={styles.detailLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Date</span>
          </div>
          <span className={styles.detailValue}>{formattedDate}</span>
        </div>

        {/* Time Row */}
        <div className={styles.detailRow}>
          <div className={styles.detailLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Time</span>
          </div>
          <span className={styles.detailValue}>{timeRange}</span>
        </div>

        {/* Location Row */}
        <div className={styles.detailRow}>
          <div className={styles.detailLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Location</span>
          </div>
          <span className={styles.detailValue}>{locationText}</span>
        </div>

        {/* Earnings Row */}
        <div className={styles.detailRow}>
          <div className={styles.detailLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            <span>Your Earnings</span>
          </div>
          <span className={styles.earningsValue}>{earningsText}</span>
        </div>
      </div>

      {/* Stepper Card */}
      <div className={styles.stepperCard}>
        <h3 className={styles.stepperTitle}>Application Status</h3>
        <div className={styles.stepperList}>
          {/* Step 1 */}
          <div className={styles.stepItem}>
            <div className={styles.stepIconSuccess}>✓</div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepLabel}>Request Sent</h4>
              <p className={styles.stepDesc}>Your request was submitted successfully</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className={styles.stepItem}>
            <div className={isConfirmed ? styles.stepIconSuccess : styles.stepIconActive}>
              {isConfirmed ? '✓' : '⏳'}
            </div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepLabel}>Waiting for Parent</h4>
              <p className={styles.stepDesc}>Parent is reviewing your profile and rate</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className={styles.stepItem}>
            <div className={isConfirmed ? styles.stepIconSuccess : styles.stepIconPending}>
              {isConfirmed ? '✓' : '🛡️'}
            </div>
            <div className={styles.stepContent}>
              <h4 className={styles.stepLabel}>Job Confirmed</h4>
              <p className={styles.stepDesc}>Both parties agreed to start session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Start Job Action */}
      <div className={styles.actionSection}>
        <button
          type="button"
          disabled={!isConfirmed}
          className={isConfirmed ? styles.startJobBtnActive : styles.startJobBtnDisabled}
          onClick={() => {
            if (isConfirmed) {
              navigate('/active-job-details', { state: { job } });
            }
          }}
        >
          Start Job
        </button>
        {!isConfirmed && (
          <p className={styles.startJobHelper}>
            Button will be active once parent confirms job
          </p>
        )}
      </div>

      <BabysitterBottomNav />
    </div>
  );
}
