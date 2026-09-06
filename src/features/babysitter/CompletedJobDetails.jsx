import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import styles from './completed-job-details.module.css';

const Icons = {
  calendarOutline: () => (
    <svg className={styles.detailIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  timeOutline: () => (
    <svg className={styles.detailIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  locationOutline: () => (
    <svg className={styles.detailIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  happyOutline: () => (
    <svg className={styles.detailIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  cashOutline: () => (
    <svg className={styles.detailIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <line x1="6" y1="6" x2="6" y2="6.01" />
    </svg>
  ),
  walletOutline: () => (
    <svg className={styles.detailIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="9" x2="16" y2="9" />
      <path d="M16 15h.01" />
    </svg>
  ),
};

export default function CompletedJobDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;
  const [avatarFailed, setAvatarFailed] = useState(false);

  if (!job) {
    return (
      <div className={styles.emptyScreen}>
        <EmptyState
          icon="🏁"
          title="No Completed Job Found"
          description="We couldn't retrieve historical details for this completed babysitting session."
        >
          <Button variant="primary" onClick={() => navigate("/babysitter-my-jobs")}>
            Back to Assigned Jobs
          </Button>
        </EmptyState>
        <BabysitterBottomNav />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Completed Date';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const timeRange = job.SlotTimes?.length > 0
    ? `${job.SlotTimes[0].StartTime?.substring(0, 5)} - ${job.SlotTimes[job.SlotTimes.length - 1].EndTime?.substring(0, 5)}`
    : 'Full Session';

  const rows = [
    { icon: 'calendarOutline', label: 'Date', value: formatDate(job.JobDate) },
    { icon: 'timeOutline', label: 'Time', value: timeRange },
    { icon: 'locationOutline', label: 'Location', value: job.City || 'Islamabad' },
    { icon: 'happyOutline', label: 'Child', value: `${job.ChildName || 'Child'}, ${job.ChildAge || '?'} Yrs` },
    { icon: 'cashOutline', label: 'Payment Rate', value: `PKR ${job.Payment || 0} / hr` },
    { icon: 'walletOutline', label: 'Total Earned', value: `PKR ${job.Payment || 0}`, isSuccess: true, last: true },
  ];

  return (
    <div className={styles.jobScreen}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <BackButton />
          <h2 className={styles.headerTitle}>Job Summary</h2>
          <div className={styles.spacer} />
        </header>

        {/* Status Badge Card (92px stats row) */}
        <section className={styles.statusCard}>
          <div className={styles.statusBadge}>
            <span className={styles.statusBadgeText}>Job Completed</span>
          </div>
          <p className={styles.statusDesc}>
            This job has been successfully completed and archived.</p>
        </section>

        {/* Parent Details Card */}
        <section className={styles.parentCard}>
          <div className={styles.parentRow}>
            <div className={styles.avatarWrap}>
              {!avatarFailed && job.ParentPic ? (
                <img
                  src={job.ParentPic.startsWith('http') ? job.ParentPic : `/api/images/default/${job.ParentPic}`}
                  alt={job.ParentName || 'parent'}
                  className={styles.avatarImg}
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {(job.ParentName?.trim().charAt(0) || 'P').toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className={styles.parentName}>{job.ParentName || 'Parent'}</p>
              <div className={styles.ratingRow}>
                <span className={styles.ratingStar}>★ {job.ParentRating ? job.ParentRating.toFixed(1) : '5.0'}</span>
                <span className={styles.ratingDot}>•</span>
                <span className={styles.parentId}>ID: {job.Parent_ID ? `PK-${job.Parent_ID}` : 'N/A'}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/babysitter-notifications')} className={styles.conversationBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            View Conversation
          </button>
        </section>

        {/* Job Details Rows */}
        <section className={styles.detailsCard}>
          {rows.map((r) => {
            const IconRenderer = Icons[r.icon];
            return (
              <div key={r.label} className={styles.detailRow}>
                <div className={styles.detailRowLeft}>
                  {IconRenderer ? <IconRenderer /> : null}
                  <span className={styles.detailLabel}>{r.label}</span>
                </div>
                <span className={`${styles.detailValue} ${r.isSuccess ? styles.detailValueSuccess : ''}`}>
                  {r.value}
                </span>
              </div>
            );
          })}
        </section>
      </div>
      <BabysitterBottomNav />
    </div>
    );
}
