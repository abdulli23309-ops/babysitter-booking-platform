import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `https://localhost:44368/api/images/${type}/${filename}`;
  }
  return `https://localhost:44368/api/images/default/${pic}`;
};

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  location: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#F5A623" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  message: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  checkCircle: (filled) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? orange : 'none'} stroke={filled ? 'none' : '#ccc'} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      {filled && <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />}
    </svg>
  ),
};

const ParentUpcomingJobScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedJob = location.state?.job;   // the whole job object from MyJobsScreen
  const [job, setJob] = useState(passedJob || null);
  const [loading, setLoading] = useState(false);

  // Fetch job details if not passed
  useEffect(() => {
    if (job) return;
    const jobId = location.state?.jobId;
    if (!jobId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`https://localhost:44368/api/jobs/jobdetails/${jobId}`)
      .then(res => res.json())
      .then(data => setJob(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // ---------- Helpers ----------
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const getTimeRange = () => {
    if (!job?.SlotTimes || job.SlotTimes.length === 0) return 'TBD';
    const start = job.SlotTimes[0].StartTime?.substring(0,5) || '?';
    const end = job.SlotTimes[job.SlotTimes.length-1].EndTime?.substring(0,5) || '?';
    return `${start} - ${end}`;
  };

  const jobStatus = job?.Status;  // "Open", "Assigned", etc.
  const isSitterAssigned = job?.AssignedSitter_ID != null;
  const sitterName = job?.SitterName || 'Not assigned yet';
  const sitterPic = job?.SitterPicture || null;

  // Status steps (matching mockup)
  const steps = [
    { label: 'Request Sent', completed: true },
    { label: 'Waiting for Sitter', completed: isSitterAssigned },
    { label: 'Job Confirmed', completed: jobStatus === 'In Progress' },
  ];

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading job details…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={styles.centered}>
        <p>No job details available.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <Icons.arrowBack />
        </button>
        <h2 style={styles.title}>Job Details</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* WAITING FOR CONFIRMATION banner */}
      <div style={styles.banner}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" style={{ marginRight: 8 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="1" fill="#F5A623" />
        </svg>
        <span style={styles.bannerText}>WAITING FOR CONFIRMATION</span>
        <span style={styles.bannerSub}>Your proposal has been sent to the sitter.</span>
      </div>

      {/* Sitter Card */}
      <div style={styles.card}>
        <div style={styles.sitterRow}>
          <img
            src={buildImageUrl(sitterPic)}
            alt="Sitter"
            style={styles.avatar}
            onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=32'; }}
          />
          <div style={{ flex: 1, marginLeft: 12 }}>
            <div style={styles.sitterName}>{sitterName}</div>
            {isSitterAssigned && (
              <div style={styles.ratingRow}>
                <Icons.star />
                <span style={{ fontWeight: 600, margin: '0 4px' }}>{job?.SitterRating ?? '4.8'}</span>
                <span style={{ color: '#888' }}>starring</span>
              </div>
            )}
          </div>
          <div style={styles.messageBtn}>
            <Icons.message />
            <span style={{ marginLeft: 6, fontWeight: 600, color: '#555' }}>Message Sitter</span>
          </div>
        </div>
      </div>

      {/* Job Info */}
      <div style={styles.card}>
        <div style={styles.infoRow}>
          <Icons.calendar />
          <span style={styles.infoText}>Date</span>
          <span style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: '#333' }}>{formatDate(job.JobDate)}</span>
        </div>
        <div style={styles.infoRow}>
          <Icons.clock />
          <span style={styles.infoText}>Time</span>
          <span style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: '#333' }}>{getTimeRange()}</span>
        </div>
        <div style={styles.infoRow}>
          <Icons.location />
          <span style={styles.infoText}>Location</span>
          <span style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: '#333' }}>{job.City || 'Not specified'}</span>
        </div>
        <div style={styles.infoRowLast}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" style={{ marginRight: 10 }}>
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <line x1="6" y1="6" x2="6" y2="6.01" />
          </svg>
          <span style={styles.infoText}>Payment Rate</span>
          <span style={{ flex: 1, textAlign: 'right', fontWeight: 600, color: '#333' }}>PKR {job.Payment}/hr</span>
        </div>
      </div>

      {/* Application Status Tracker */}
      <div style={styles.card}>
        <h4 style={styles.sectionTitle}>Application Status</h4>
        <div style={styles.stepsContainer}>
          {steps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: idx < steps.length-1 ? 12 : 0 }}>
              <div style={{ marginRight: 12 }}>
                {step.completed ? (
                  <div style={styles.stepCompleted}><Icons.checkCircle filled={step.completed} /></div>
                ) : (
                  <div style={styles.stepPending}><Icons.checkCircle filled={false} /></div>
                )}
              </div>
              <span style={{ color: step.completed ? '#333' : '#aaa', fontWeight: step.completed ? 600 : 400 }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Button (if job is open) */}
      {jobStatus === 'Open' && (
        <button onClick={() => {
          // Cancel logic here (update status to Cancelled)
          // You can add a cancel confirmation modal as needed
          navigate('/my-jobs');
        }} style={styles.cancelBtn}>
          Cancel Job
        </button>
      )}

      <ParentBottomNav />
    </div>
  );
};

const styles = {
  screen: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)',
    paddingBottom: 100,
    fontFamily: "'Nunito', sans-serif",
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px 10px',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#fff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    fontWeight: 700,
    fontSize: 18,
    color: '#2D3142',
  },
  banner: {
    background: '#FFF9E6',
    borderRadius: 16,
    margin: '0 16px 12px',
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    border: '1px solid #F5E6B8',
  },
  bannerText: {
    fontWeight: 700,
    color: '#B66D0A',
    marginRight: 8,
    fontSize: 13,
  },
  bannerSub: {
    color: '#666',
    fontSize: 12,
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    margin: '0 16px 12px',
    padding: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  sitterRow: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  sitterName: {
    fontWeight: 700,
    fontSize: 16,
    color: '#2D3142',
    marginBottom: 2,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: '#555',
  },
  messageBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: 20,
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 14,
    borderBottom: '1px solid #f5f5f5',
    paddingBottom: 12,
  },
  infoRowLast: {
    display: 'flex',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 10,
    color: '#777',
    fontWeight: 500,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#2D3142',
    margin: '0 0 12px',
  },
  stepsContainer: {
    paddingLeft: 4,
  },
  stepCompleted: {
    width: 24,
    height: 24,
  },
  stepPending: {
    width: 24,
    height: 24,
  },
  cancelBtn: {
    margin: '8px 16px',
    width: 'calc(100% - 32px)',
    padding: 16,
    borderRadius: 16,
    border: 'none',
    background: '#e74c3c',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
  },
};

export default ParentUpcomingJobScreen;