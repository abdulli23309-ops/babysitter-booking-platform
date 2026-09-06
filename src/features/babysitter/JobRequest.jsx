import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../services/api';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import styles from './job-request.module.css';

const SLOT_LABELS = {
  1: '8–10 AM',
  2: '10 AM–12 PM',
  3: '12–2 PM',
  4: '2–4 PM',
  5: '4–6 PM',
  6: '6–8 PM',
  7: '8–10 PM',
  8: '10 PM–12 AM',
};

export default function JobRequest() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(userId));
  const [acceptingGroupId, setAcceptingGroupId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await API.getJobRequests(userId);
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load incoming job requests.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const handleRefresh = async () => {
    toast.info('Refreshing job requests...');
    setRefreshing(true);
    await loadJobs();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const data = await API.getJobRequests(userId);
        if (!ignore) {
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!ignore) {
          toast.error('Could not load incoming job requests.');
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

  // Group jobs by parent
  const groupedJobs = useMemo(() => {
    const groups = {};
    jobs.forEach((job) => {
      const isParentDeleted = job.IsParentDeleted || (!job.ParentName && !job.Parent_ID);
      const parentName = isParentDeleted
        ? 'Deactivated Parent'
        : (job.ParentName ?? job.parent?.name ?? 'Parent');
      const parentKey = job.Parent_ID ?? job.ParentName ?? 'unknown';

      if (!groups[parentKey]) {
        groups[parentKey] = {
          parentId: parentKey,
          parentName,
          isParentDeleted,
          parentRating: job.ParentRating ?? 5.0,
          city: job.City ?? 'Islamabad',
          jobs: [],
          totalPayment: 0,
          slotLabels: new Set(),
        };
      }
      const group = groups[parentKey];
      group.jobs.push(job);
      group.totalPayment += (job.Payment ?? 500);
      const slots = job.RequiredSlotIds || [];
      slots.forEach((s) => group.slotLabels.add(SLOT_LABELS[s] || `Slot ${s}`));
    });

    return Object.values(groups).map((group) => {
      const dates = group.jobs.map((j) => new Date(j.JobDate));
      dates.sort((a, b) => a - b);
      const first = dates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Date';
      const last = dates[dates.length - 1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Date';
      group.dateRange = dates.length === 1 ? first : `${first} – ${last}`;
      group.slotLabelsStr = [...group.slotLabels].join(', ') || 'Standard hours';
      return group;
    });
  }, [jobs]);

  const handleAcceptAll = async (group) => {
    const jobIds = group.jobs.map((j) => j.Job_ID);
    setAcceptingGroupId(group.parentId);
    try {
      await API.confirmJobsBulk(jobIds, userId);
      setJobs((prev) => prev.filter((j) => !jobIds.includes(j.Job_ID)));
      toast.success('Job request accepted successfully!');
      navigate('/job-accepted-success');
    } catch {
      toast.error('Failed to accept booking. Please try again.');
      loadJobs();
    } finally {
      setAcceptingGroupId(null);
    }
  };

  const handleViewDetails = (job) => {
    navigate('/job-details', { state: { job, jobId: job.Job_ID } });
  };

  const handleRejectJob = async (group) => {
    setAcceptingGroupId(group.parentId);
    try {
      const firstJobId = group.jobs[0]?.Job_ID;
      if (firstJobId) {
        await API.rejectJob(firstJobId);
      }
      setJobs((prev) => prev.filter((j) => !group.jobs.map((gj) => gj.Job_ID).includes(j.Job_ID)));
      toast.info('Job request declined.');
    } catch {
      toast.error('Could not decline request.');
    } finally {
      setAcceptingGroupId(null);
    }
  };

  return (
    <div className={styles.requestContainer}>
      {/* Top Bar with Single BackButton, Filter & Notifications (Image 3) */}
      <header className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Job Requests</h1>
        <div className={styles.topBarRight}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleRefresh}
            aria-label="Refresh job requests"
            title="Refresh"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 0.5s ease',
                transform: refreshing ? 'rotate(360deg)' : 'none',
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </header>

      {/* Title Area (Image 3) */}
      <section className={styles.titleArea}>
        <p className={styles.subtitle}>Based on your Availability</p>
      </section>

      {/* Content */}
      {loading ? (
        <div style={{ padding: 'var(--space-8) 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner size="lg" label="Checking new job requests..." />
        </div>
      ) : groupedJobs.length === 0 ? (
        <EmptyState
          title="No Pending Job Requests"
          description="You currently have no new booking invitations matching your schedule."
          actionLabel="Set Availability"
          onAction={() => navigate('/set-availability')}
        />
      ) : (
        <div className={styles.requestsList}>
          {groupedJobs.map((group) => {
            const isAccepting = acceptingGroupId === group.parentId;

            return (
              <div
                key={group.parentId}
                className={styles.requestCard}
                onClick={() => handleViewDetails(group.jobs[0])}
              >
                {/* Header: Avatar, Name + Rating, Hourly Rate */}
                <div className={styles.cardHeader}>
                  <div className={styles.parentInfo}>
                    <div className={styles.parentAvatar}>
                      {(group.parentName.charAt(0) || 'P').toUpperCase()}
                    </div>
                    <div>
                      <h3 className={styles.parentNameText}>
                        {group.parentName}
                        {group.isParentDeleted && (
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginLeft: '6px', fontWeight: 'normal' }}>
                            (Inactive)
                          </span>
                        )}
                      </h3>
                      <span className={styles.parentSubText}>
                        ★ {Number(group.parentRating || 5).toFixed(1)} • {group.city}
                      </span>
                    </div>
                  </div>
                  <span className={styles.paymentPill}>
                    PKR {group.totalPayment.toLocaleString()}
                  </span>
                </div>

                <div className={styles.detailsBox}>
                  {/* Meta details list */}
                  <div className={styles.cardDetailsList}>
                    <div className={styles.detailRow}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                      </svg>
                      <span><strong>Dates:</strong> {group.dateRange} ({group.jobs.length} day{group.jobs.length !== 1 ? 's' : ''})</span>
                    </div>
                    <div className={styles.detailRow}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span><strong>Slots:</strong> {group.slotLabelsStr}</span>
                    </div>
                  </div>

                  {/* Actions: View Details & Apply Now (Image 3) */}
                  <div className={styles.cardActionRow}>
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      disabled={isAccepting}
                      onClick={() => handleRejectJob(group)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      loading={isAccepting}
                      disabled={group.isParentDeleted}
                      onClick={() => handleAcceptAll(group)}
                    >
                      Accept All ({group.jobs.length})
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BabysitterBottomNav />
    </div>
  );
}
