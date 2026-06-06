import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../Services/api';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

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

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  locationOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  calendarOutline: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  briefcaseOutline: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  timeOutline: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  refreshOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
};

const Bubble = ({ onClick, children }) => (
  <div onClick={onClick} style={{
    width: 44, height: 44, borderRadius: '50%', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer',
  }}>{children}</div>
);

const Row = ({ icon, children }) => {
  const IconComp = Icons[icon];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555' }}>
      {IconComp && <IconComp />}
      <span>{children}</span>
    </div>
  );
};

const EmptyState = ({ onRefresh }) => (
  <div style={{ textAlign: 'center', marginTop: 80 }}>
    <Icons.briefcaseOutline style={{ fontSize: 60, opacity: 0.2, display: 'block', margin: '0 auto 16px' }} />
    <p style={{ fontWeight: 600, fontSize: 16, color: '#666' }}>No matching jobs right now</p>
    <p style={{ fontSize: 13, color: '#999', margin: '4px 0 20px', lineHeight: 1.6 }}>
      No open jobs match your availability.
    </p>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      <button onClick={onRefresh}
        style={{ padding: '10px 22px', borderRadius: 20, background: orange, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
        Refresh
      </button>
      <button onClick={() => window.location.assign('/set-availability')}
        style={{ padding: '10px 22px', borderRadius: 20, background: '#fff', color: orange, border: `1.5px solid ${orange}`, fontWeight: 700, cursor: 'pointer' }}>
        Set Availability
      </button>
    </div>
  </div>
);

const JobRequest = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingGroupId, setAcceptingGroupId] = useState(null);
  const sitterId = Number(localStorage.getItem('userId'));

  const loadJobs = async () => {
    if (!sitterId) return;
    setLoading(true);
    try {
      const data = await API.getJobRequests(sitterId);
      console.log('✅ Matched jobs from backend:', data);
      setJobs(data);
    } catch (err) {
      console.error('Failed to load job requests', err);
      alert('Could not load job requests.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Group jobs by parent (for bulk acceptance)
  const groupedJobs = useMemo(() => {
    const groups = {};
    jobs.forEach(job => {
      const parentId = job.ParentName || job.Parent_ID || 'unknown';
      if (!groups[parentId]) {
        groups[parentId] = {
          parentId,
          parentName: job.ParentName || 'Unknown Parent',
          parentRating: job.ParentRating || 0,
          city: job.City,
          jobs: [],
          totalPayment: 0,
          slotLabels: new Set(),
        };
      }
      const group = groups[parentId];
      group.jobs.push(job);
      group.totalPayment += job.Payment || 0;
      const slots = job.RequiredSlotIds || [];
      slots.forEach(s => group.slotLabels.add(SLOT_LABELS[s] || `Slot ${s}`));
    });

    return Object.values(groups).map(group => {
      const dates = group.jobs.map(j => new Date(j.JobDate));
      dates.sort((a, b) => a - b);
      const first = dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const last = dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      group.dateRange = dates.length === 1 ? first : `${first} – ${last}`;
      group.slotLabelsStr = [...group.slotLabels].join(', ');
      return group;
    });
  }, [jobs]);

  const handleAcceptAll = async (group) => {
    const jobIds = group.jobs.map(j => j.Job_ID);
    setAcceptingGroupId(group.parentId);
    try {
      await API.confirmJobsBulk(jobIds, sitterId);
      // Remove accepted jobs from state
      setJobs(prev => prev.filter(j => !jobIds.includes(j.Job_ID)));
      navigate('/job-accepted-success');
    } catch (err) {
      console.error('Bulk accept failed', err);
      alert('❌ Failed to accept jobs. Please try again.');
      loadJobs(); // refresh to restore state
    } finally {
      setAcceptingGroupId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f5c6d6,#b2d8d8)' }}>
      <div style={{ padding: '20px 16px', paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Bubble onClick={() => navigate(-1)}>
            <Icons.arrowBack />
          </Bubble>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>Job Requests</h2>
            <p style={{ margin: 0, color: '#888', fontSize: 12 }}>
              {jobs.length} match{ jobs.length !== 1 ? 'es' : '' }
            </p>
          </div>
          <Bubble onClick={loadJobs}>
            <Icons.refreshOutline />
          </Bubble>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: '#666', marginTop: 12 }}>Finding jobs…</p>
          </div>
        ) : groupedJobs.length === 0 ? (
          <EmptyState onRefresh={loadJobs} />
        ) : (
          groupedJobs.map(group => (
            <div key={group.parentId} style={{ background: '#fff', marginBottom: 16, borderRadius: 20, boxShadow: '0 6px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
              <div style={{ height: 4, background: `linear-gradient(90deg,${orange},#f5a623)` }} />
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{group.parentName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Icons.star />
                      <span style={{ fontSize: 12, color: '#888' }}>
                        {group.parentRating && group.parentRating > 0 ? group.parentRating.toFixed(1) : 'New Client'}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: orange, fontWeight: 800, fontSize: 20 }}>{group.totalPayment}</span>
                    <div style={{ fontSize: 10, color: '#bbb', fontWeight: 600 }}>PKR</div>
                  </div>
                </div>
                <div style={{ marginTop: 14, borderTop: '1px solid #f4f4f4', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Row icon="calendarOutline">{group.dateRange}</Row>
                  <Row icon="locationOutline">{group.city || 'Location TBD'}</Row>
                  {group.slotLabelsStr && <Row icon="timeOutline">{group.slotLabelsStr}</Row>}
                </div>
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => handleAcceptAll(group)}
                    disabled={acceptingGroupId === group.parentId}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 14, background: orange, color: '#fff',
                      border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      opacity: acceptingGroupId === group.parentId ? 0.7 : 1,
                    }}
                  >
                    {acceptingGroupId === group.parentId ? 'Accepting…' : `Accept All (${group.jobs.length} job${ group.jobs.length !== 1 ? 's' : '' })`}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <BabysitterBottomNav />
    </div>
  );
};

export default JobRequest;