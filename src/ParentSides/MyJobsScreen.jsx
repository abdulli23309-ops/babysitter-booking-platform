import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/40?img=32';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `https://localhost:44368/api/images/${type}/${filename}`;
  }
  return `https://localhost:44368/api/images/default/${pic}`;
};

/* SVG Icons */
const Icons = {
  chevronBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  time: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const MyJobsScreen = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('active');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const parentId = Number(localStorage.getItem('userId'));

  // Update current time every minute to re-check "Start" button status
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://localhost:44368/api/parent/jobs/${parentId}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
      alert('Could not load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [parentId]);

  // ---- Filtering rules ----
  // Active     = In Progress (sitter is currently working)
  // Upcoming   = Assigned (sitter accepted, not yet started) → "Hired"
  // History    = Completed or Cancelled
  // (Jobs with status "Open" are hidden from this screen)
  const activeJobs = jobs.filter(j => j.Status === 'In Progress');
  const upcomingJobs = jobs.filter(j => j.Status === 'Assigned');
  const historyJobs = jobs.filter(j => j.Status === 'Completed' || j.Status === 'Cancelled');

  /* ---------- Helpers ---------- */
  const getJobStartDateTime = (job) => {
    // Use the first slot's start time (assumes slots are sorted)
    if (!job.SlotTimes || job.SlotTimes.length === 0) return null;
    const timeStr = job.SlotTimes[0].StartTime || job.SlotTimes[0].StartTime; // "HH:mm:ss"
    const [hours, minutes] = timeStr.split(':');
    const dateObj = new Date(job.JobDate); // date part
    dateObj.setHours(Number(hours), Number(minutes), 0, 0);
    return dateObj;
  };

  const canStartJob = (job) => {
    const start = getJobStartDateTime(job);
    if (!start) return false;
    return now >= start;
  };

  const handleStartJob = async (jobId) => {
    try {
      const res = await fetch(`https://localhost:44368/api/jobs/updateStatus/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'In Progress' }),
      });
      if (res.ok) {
        fetchJobs();
      } else {
        alert('Failed to start job.');
      }
    } catch {
      alert('Server connection failed.');
    }
  };

  const handleEndJob = async (jobId) => {
    try {
      const res = await fetch(`https://localhost:44368/api/jobs/updateStatus/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Completed' }),
      });
      if (res.ok) {
        fetchJobs();
      } else {
        alert('Failed to end job.');
      }
    } catch {
      alert('Server connection failed.');
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeRange = (slots) => {
    if (!slots || slots.length === 0) return 'TBD';
    const start = slots[0].StartTime?.substring(0, 5) || '?';
    const end = slots[slots.length - 1].EndTime?.substring(0, 5) || '?';
    return `${start} - ${end}`;
  };

  const tabBtnStyle = (tab) => ({
    flex: 1,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '50px',
    padding: '11px 6px',
    fontSize: '13px',
    fontWeight: 'bold',
    background: selectedTab === tab ? orange : 'transparent',
    color: selectedTab === tab ? '#fff' : '#888',
    boxShadow: selectedTab === tab ? '0 4px 12px rgba(232,98,42,0.35)' : 'none',
    transition: 'all 0.2s ease',
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '16px', color: '#666' }}>Loading jobs…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)', paddingBottom: '100px' }}>
      <div style={{ padding: '20px', paddingBottom: '120px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#fff',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <Icons.chevronBack />
          </button>
          <h2 style={{ margin: 0, fontWeight: '700', fontSize: '20px', color: '#2D3142' }}>My Jobs</h2>
          <div style={{ width: '38px' }} />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '50px',
            padding: '4px',
            marginBottom: '20px',
            gap: '4px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          }}
        >
          <button style={tabBtnStyle('active')} onClick={() => setSelectedTab('active')}>
            Active
          </button>
          <button style={tabBtnStyle('upcoming')} onClick={() => setSelectedTab('upcoming')}>
            Upcoming
          </button>
          <button style={tabBtnStyle('history')} onClick={() => setSelectedTab('history')}>
            History
          </button>
        </div>

        {/* ---- Active Jobs ---- */}
        {selectedTab === 'active' &&
          activeJobs.map((job) => (
            <div
              key={job.Job_ID}
              style={styles.card}
              onClick={() => navigate('/parent-active-job', { state: { job } })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#2D3142' }}>
                    {job.ChildName || 'Child'}
                  </h3>
                  <span style={styles.badgeActive}>In Progress</span>
                </div>
                {job.SitterPicture && (
                  <img
                    src={buildImageUrl(job.SitterPicture)}
                    alt="sitter"
                    style={styles.avatar}
                  />
                )}
              </div>
              <JobDetails
                date={formatDate(job.JobDate)}
                time={formatTimeRange(job.SlotTimes)}
                sitter={job.SitterName || '—'}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  style={{ ...styles.btnSecondary, opacity: 0.5, cursor: 'not-allowed' }}
                >
                  Start Job
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEndJob(job.Job_ID);
                  }}
                  style={styles.btnDanger}
                >
                  End Job
                </button>
              </div>
            </div>
          ))}

        {/* ---- Upcoming Jobs (Hired) ---- */}
        {selectedTab === 'upcoming' &&
          upcomingJobs.map((job) => {
            const startEnabled = canStartJob(job);
            return (
              <div
                key={job.Job_ID}
                style={styles.card}
                onClick={() => navigate('/parent-upcoming-job', { state: { job } })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#2D3142' }}>
                      {job.ChildName || 'Child'}
                    </h3>
                    <span style={styles.badgeUpcoming}>Hired</span>
                  </div>
                  {job.SitterPicture && (
                    <img
                      src={buildImageUrl(job.SitterPicture)}
                      alt="sitter"
                      style={styles.avatar}
                    />
                  )}
                </div>
                <JobDetails
                  date={formatDate(job.JobDate)}
                  time={formatTimeRange(job.SlotTimes)}
                  sitter={job.SitterName || '—'}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (startEnabled) handleStartJob(job.Job_ID);
                    }}
                    style={{
                      ...styles.btnPrimary,
                      opacity: startEnabled ? 1 : 0.5,
                      cursor: startEnabled ? 'pointer' : 'not-allowed',
                    }}
                    title={startEnabled ? 'Start this job' : 'You can start the job only at the scheduled time'}
                  >
                    Start Job
                  </button>
                  <button
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    style={styles.btnDisabled}
                  >
                    End Job
                  </button>
                </div>
              </div>
            );
          })}

        {/* ---- History Jobs ---- */}
        {selectedTab === 'history' &&
          historyJobs.map((job) => (
            <div
              key={job.Job_ID}
              style={styles.card}
              onClick={() => navigate('/babysitter-details-2', { state: { job } })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#2D3142' }}>
                    {job.ChildName || 'Child'}
                  </h3>
                  <JobDetails
                    date={formatDate(job.JobDate)}
                    time={formatTimeRange(job.SlotTimes)}
                    sitter={job.SitterName || '—'}
                  />
                </div>
                {job.SitterPicture && (
                  <img
                    src={buildImageUrl(job.SitterPicture)}
                    alt="sitter"
                    style={styles.avatar}
                  />
                )}
              </div>
            </div>
          ))}
      </div>
      <ParentBottomNav />
    </div>
  );
};

/* Reusable job info */
const JobDetails = ({ date, time, sitter }) => (
  <div style={{ marginTop: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5C677D', fontSize: '13px', marginBottom: '5px' }}>
      <Icons.calendar /> {date}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5C677D', fontSize: '13px', marginBottom: '10px' }}>
      <Icons.time /> {time}
    </div>
    <div style={{ borderTop: '1px solid #F0F4F8', paddingTop: '8px', fontSize: '12px', color: '#8E9AAF' }}>
      Sitter: <span style={{ color: '#2D3142', fontWeight: '600' }}>{sitter || '—'}</span>
    </div>
  </div>
);

/* Inline styles */
const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    marginBottom: '14px',
    cursor: 'pointer',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#F7F9FC',
    objectFit: 'cover',
    marginLeft: '10px',
  },
  badgeActive: {
    background: '#FFF0E6',
    color: orange,
    padding: '3px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '4px',
  },
  badgeUpcoming: {
    background: '#E6F2FF',
    color: '#007AFF',
    padding: '3px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '4px',
    textTransform: 'uppercase',
  },
  btnPrimary: {
    flex: 1,
    border: 'none',
    borderRadius: '20px',
    padding: '8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: '#E0F9F1',
    color: '#27AE60',
  },
  btnSecondary: {
    flex: 1,
    border: 'none',
    borderRadius: '20px',
    padding: '8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: '#F4F7F9',
    color: '#555',
  },
  btnDanger: {
    flex: 1,
    border: 'none',
    borderRadius: '20px',
    padding: '8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: '#FFE5E8',
    color: '#EB5757',
  },
  btnDisabled: {
    flex: 1,
    border: 'none',
    borderRadius: '20px',
    padding: '8px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    background: '#F4F7F9',
    color: '#B0B9C8',
    opacity: 0.6,
    cursor: 'default',
  },
};

export default MyJobsScreen;