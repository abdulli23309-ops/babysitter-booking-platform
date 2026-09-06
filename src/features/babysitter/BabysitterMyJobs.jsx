import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import { apiGet } from '../../services/apiClient';
import styles from './babysitter-jobs.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=33';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

export default function BabysitterMyJobs() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const toast = useToast();

  const [selectedTab, setSelectedTab] = useState('active');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(userId));

  const fetchJobs = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await apiGet(`/jobs/sitter/${userId}`);
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load your assigned jobs.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiGet(`/jobs/sitter/${userId}`);
        if (!ignore) {
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!ignore) {
          toast.error('Could not load your assigned jobs.');
          setJobs([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [userId, toast]);

  const activeJobs = jobs.filter((j) => j.Status === 'In Progress');
  const upcomingJobs = jobs.filter((j) => j.Status === 'Assigned');
  const historyJobs = jobs.filter((j) => j.Status === 'Completed' || j.Status === 'Cancelled');

  const displayedJobs =
    selectedTab === 'active'
      ? activeJobs
      : selectedTab === 'upcoming'
      ? upcomingJobs
      : historyJobs;

  const handleJobClick = (job) => {
    if (job.Status === 'In Progress') {
      navigate('/active-job-details', { state: { job } });
    } else if (job.Status === 'Assigned') {
      navigate('/upcoming-job-details', { state: { job } });
    } else {
      navigate('/completed-job-details', { state: { job } });
    }
  };

  return (
    <div className={styles.jobsContainer}>
      {/* Top Header Bar with Universal BackButton and Filter */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <BackButton />
          <h1 className={styles.title}>My Jobs</h1>
        </div>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={fetchJobs}
          aria-label="Refresh and filter jobs"
          title="Refresh Schedule"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </header>

      {/* Segmented Pill Tabs Switcher (Mockup Frame 119) */}
      <nav className={styles.segmentedContainer} aria-label="Jobs Filter Tabs">
        <button
          type="button"
          className={`${styles.segmentedTab} ${selectedTab === 'active' ? styles.segmentedTabActive : ''}`}
          onClick={() => setSelectedTab('active')}
        >
          <span>Active Jobs</span>
          <span className={styles.tabBadge}>{activeJobs.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.segmentedTab} ${selectedTab === 'upcoming' ? styles.segmentedTabActive : ''}`}
          onClick={() => setSelectedTab('upcoming')}
        >
          <span>Upcoming</span>
          <span className={styles.tabBadge}>{upcomingJobs.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.segmentedTab} ${selectedTab === 'history' ? styles.segmentedTabActive : ''}`}
          onClick={() => setSelectedTab('history')}
        >
          <span>History</span>
          <span className={styles.tabBadge}>{historyJobs.length}</span>
        </button>
      </nav>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner size="lg" label="Loading schedule..." />
        </div>
      ) : displayedJobs.length === 0 ? (
        <EmptyState
          title={
            selectedTab === 'active'
              ? 'No active babysitting sessions'
              : selectedTab === 'upcoming'
              ? 'No upcoming bookings scheduled'
              : 'No past job records found'
          }
          description={
            selectedTab === 'upcoming'
              ? 'Check incoming Job Requests to accept new bookings.'
              : 'Your scheduled and completed bookings will appear here.'
          }
          actionLabel={selectedTab === 'upcoming' ? 'View Requests' : undefined}
          onAction={selectedTab === 'upcoming' ? () => navigate('/job-request') : undefined}
        />
      ) : (
        <div className={styles.jobsList}>
          {displayedJobs.map((job) => {
            const dateStr = job.JobDate
              ? new Date(job.JobDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Scheduled Date';

            const timeRange = job.SlotTimes?.length
              ? `${job.SlotTimes[0].StartTime?.substring(0, 5)} - ${job.SlotTimes[job.SlotTimes.length - 1].EndTime?.substring(0, 5)}`
              : job.StartTime && job.EndTime
              ? `${job.StartTime?.substring(0, 5)} - ${job.EndTime?.substring(0, 5)}`
              : 'Flexible Hours';

            const isDeactivated = job.IsParentDeleted || job.ParentName === 'Deactivated Parent';
            const parentName = isDeactivated
              ? 'Deactivated Parent'
              : (job.ParentName ?? job.parent?.name ?? 'Parent Client');
            const childName = job.ChildName ?? job.child?.name ?? 'Child';
            const childAge = job.ChildAge ?? job.child?.age;
            const payment = job.Payment ?? (job.HourlyRate ? job.HourlyRate * 4 : 0);
            const hourlyRate = job.HourlyRate ?? 350;
            const location = job.Address ?? job.City ?? 'Islamabad';
            const jobIdFormatted = `PK-${String(job.Job_ID || 100).padStart(4, '0')}`;

            return (
              <div
                key={job.Job_ID}
                className={styles.jobCard}
              >
                {/* Header: Avatar, Name + ID, Status Badge */}
                <div className={styles.cardHeader}>
                  <div className={styles.userInfo}>
                    <img
                      src={buildImageUrl(job.ParentPicture)}
                      alt={parentName}
                      className={styles.avatarImg}
                      onError={(e) => {
                        e.target.src = 'https://i.pravatar.cc/100?img=33';
                      }}
                    />
                    <div className={styles.userMeta}>
                      <h3 className={styles.userName}>{parentName}</h3>
                      <span className={styles.userIdText}>ID: {jobIdFormatted}</span>
                    </div>
                  </div>

                  {job.Status === 'In Progress' ? (
                    <span className={styles.badgeActive}>
                      <span className={styles.pulsingDot} />
                      Active
                    </span>
                  ) : job.Status === 'Assigned' ? (
                    <span className={styles.badgeUpcoming}>
                      Upcoming
                    </span>
                  ) : job.Status === 'Completed' ? (
                    <span className={styles.badgeCompleted}>
                      Completed
                    </span>
                  ) : (
                    <span className={styles.badgeCancelled}>
                      {job.Status}
                    </span>
                  )}
                </div>

                {/* Meta details list matching Frame 119 */}
                <div className={styles.metaList}>
                  <div className={styles.metaRow}>
                    <span>👶</span>
                    <span className={styles.metaLabel}>CHILD:</span>
                    <span className={styles.metaValue}>
                      {childName} {childAge ? `(${childAge}y)` : ''}
                    </span>
                  </div>

                  <div className={styles.metaRow}>
                    <span>💵</span>
                    <span className={styles.metaLabel}>RATE:</span>
                    <span className={styles.metaValue}>
                      PKR {hourlyRate}/hr
                    </span>
                  </div>

                  <div className={styles.metaRow}>
                    <span>📍</span>
                    <span className={styles.metaLabel}>LOCATION:</span>
                    <span className={styles.metaValue}>{location}</span>
                  </div>

                  <div className={styles.metaRow}>
                    <span>📅</span>
                    <span className={styles.metaLabel}>SCHEDULE:</span>
                    <span className={styles.metaValue}>{dateStr}, {timeRange}</span>
                  </div>
                </div>

                {/* Action button row matching Frame 119 */}
                {selectedTab === 'active' ? (
                  <button
                    type="button"
                    className={styles.primaryActionBtn}
                    onClick={() => handleJobClick(job)}
                  >
                    <span>View Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ) : selectedTab === 'upcoming' ? (
                  <button
                    type="button"
                    className={styles.outlineActionBtn}
                    onClick={() => handleJobClick(job)}
                  >
                    <span>View Details</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                ) : (
                  <div className={styles.historyFooterRow}>
                    <div className={styles.historyPaymentInfo}>
                      <span className={styles.historyPaymentLabel}>Total Earnings</span>
                      <span className={styles.historyPaymentAmount}>PKR {payment.toLocaleString()}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.historyActionBtn}
                      onClick={() => handleJobClick(job)}
                    >
                      <span>View Details</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BabysitterBottomNav />
    </div>
  );
}

