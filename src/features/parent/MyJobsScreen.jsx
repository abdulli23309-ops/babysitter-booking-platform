import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import { apiGet } from '../../services/apiClient';
import styles from './my-jobs.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=32';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

export default function MyJobsScreen() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const toast = useToast();

  const [selectedTab, setSelectedTab] = useState('active');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(userId));

  const fetchJobs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiGet(`/parent/jobs/${userId}`);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Could not load your bookings.');
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
        const data = await apiGet(`/parent/jobs/${userId}`);
        if (!ignore) {
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err.message || 'Could not load your bookings.');
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

  const getVisibleJobs = () => {
    switch (selectedTab) {
      case 'active': return activeJobs;
      case 'upcoming': return upcomingJobs;
      case 'history': return historyJobs;
      default: return [];
    }
  };

  const handleJobClick = (job) => {
    if (selectedTab === 'active') {
      navigate('/parent-active-job', { state: { job } });
    } else if (selectedTab === 'upcoming') {
      navigate('/parent-upcoming-job', { state: { job } });
    } else {
      navigate('/babysitter-details-2', { state: { job } });
    }
  };

  const visibleJobs = getVisibleJobs();

  return (
    <div className={styles.jobsContainer}>
      {/* Top Bar with BackButton, Title, Refresh */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <BackButton />
          <h1 className={styles.title}>My Bookings</h1>
        </div>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={fetchJobs}
          aria-label="Refresh bookings"
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

      {/* Pill Tab Switcher */}
      <nav className={styles.segmentedContainer} aria-label="Bookings Filter Tabs">
        <button
          type="button"
          className={`${styles.segmentedTab} ${selectedTab === 'active' ? styles.segmentedTabActive : ''}`}
          onClick={() => setSelectedTab('active')}
        >
          <span>Active</span>
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
          <LoadingSpinner size="lg" label="Loading bookings..." />
        </div>
      ) : visibleJobs.length === 0 ? (
        <EmptyState
          title={`No ${selectedTab} bookings`}
          description={
            selectedTab === 'active'
              ? 'You have no active babysitting sessions in progress.'
              : selectedTab === 'upcoming'
              ? 'You have no upcoming confirmed bookings scheduled.'
              : 'You have no past booking records yet.'
          }
          actionLabel="Find Babysitter"
          onAction={() => navigate('/search-babysitter')}
        />
      ) : (
        <div className={styles.jobsList}>
          {visibleJobs.map((job, idx) => {
            const jobId = job.Job_ID ?? job.jobId ?? idx;
            const isSitterDeleted = job.IsSitterDeleted || (job.Status === 'Completed' && !job.SitterName && !job.AssignedSitter_ID);
            const sitterName = isSitterDeleted
              ? 'Deactivated Caregiver'
              : (job.SitterName ?? job.sitter?.name ?? job.sitterName ?? 'Assigned Babysitter');
            const childName = job.ChildName ?? job.child?.name ?? 'Child';
            const dateStr = job.JobDate
              ? new Date(job.JobDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Scheduled';
            const timeRange = job.SlotTimes?.length
              ? `${job.SlotTimes[0].StartTime?.substring(0, 5)} - ${job.SlotTimes[job.SlotTimes.length - 1].EndTime?.substring(0, 5)}`
              : job.StartTime && job.EndTime
              ? `${job.StartTime?.substring(0, 5)} - ${job.EndTime?.substring(0, 5)}`
              : 'Scheduled Hours';

            return (
              <div
                key={jobId}
                className={styles.jobCard}
                onClick={() => handleJobClick(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleJobClick(job)}
              >
                <div className={styles.jobCardHeader}>
                  <div className={styles.sitterInfo}>
                    <img
                      src={buildImageUrl(job.SitterPicture ?? job.sitter?.picture)}
                      alt={sitterName}
                      className={styles.sitterAvatar}
                      onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=32'; }}
                    />
                    <div className={styles.sitterText}>
                      <h3 className={styles.sitterName}>
                        {sitterName}
                        {isSitterDeleted && (
                          <span style={{ fontSize: '10px', color: '#94A3B8', marginLeft: '6px', fontWeight: 'normal' }}>
                            (Inactive)
                          </span>
                        )}
                      </h3>
                      <span className={styles.childTag}>👶 Caring for: {childName}</span>
                    </div>
                  </div>
                  <div>
                    {selectedTab === 'active' ? (
                      <span className={styles.statusActive}>
                        <span className={styles.pulsingDot} />
                        In Progress
                      </span>
                    ) : selectedTab === 'upcoming' ? (
                      <span className={styles.statusUpcoming}>
                        Confirmed
                      </span>
                    ) : (
                      <span className={styles.statusCompleted}>
                        {job.Status ?? 'Completed'}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.detailsStrip}>
                  <div className={styles.stripItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{dateStr}</span>
                  </div>
                  <span className={styles.stripDivider}>•</span>
                  <div className={styles.stripItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{timeRange}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`${styles.cardActionBtn} ${selectedTab === 'active' ? styles.cardActionBtnPrimary : ''}`}
                >
                  <span>{selectedTab === 'active' ? 'Live Session Tracking >' : 'View Booking Details →'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ParentBottomNav />
    </div>
  );
}

