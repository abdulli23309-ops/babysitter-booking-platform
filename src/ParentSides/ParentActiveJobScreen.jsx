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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  cash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <line x1="6" y1="6" x2="6" y2="6.01" />
    </svg>
  ),
  chevronForward: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
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

const ParentActiveJobScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job; // from MyJobsScreen (now includes AssignedSitter_ID)

  const [childAge, setChildAge] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Fetch child age
  useEffect(() => {
    if (!job || !job.Child_ID) return;
    const fetchChild = async () => {
      try {
        const res = await fetch(`https://localhost:44368/api/children/${job.Child_ID}`);
        if (res.ok) {
          const childData = await res.json();
          const age = calculateAge(childData.DOB);
          setChildAge(age);
        }
      } catch (err) {
        console.error('Could not fetch child details', err);
      }
    };
    fetchChild();
  }, [job]);

  // Live timer from job start time
  useEffect(() => {
    if (!job || !job.SlotTimes || job.SlotTimes.length === 0) return;
    const startTimeStr = job.SlotTimes[0].StartTime;
    const [hours, minutes] = startTimeStr.split(':');
    const start = new Date(job.JobDate);
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
    try {
      const res = await fetch(`https://localhost:44368/api/jobs/updateStatus/${job.Job_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Completed' }),
      });
      if (res.ok) {
        // Pass the sitter ID, child age, and timer to the review screen
        navigate('/job-end-review', {
          state: {
            job,
            elapsedSeconds,
            sitterId: job.AssignedSitter_ID,   // numeric sitter ID
            childAge: childAge,                 // actual age or null
          },
        });
      } else {
        alert('Failed to end job.');
      }
    } catch {
      alert('Server connection failed.');
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
      <div style={styles.screen}>
        <p>No active job data found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const sitterName = job.SitterName || 'Sitter';
  const sitterPic = job.SitterPicture || null;
  const childName = job.ChildName || 'Child';
  const locationText = job.City || 'Not specified';
  const paymentRate = job.Payment || 0;
  const sitterIdDisplay = job.AssignedSitter_ID
    ? `ID: PK-${String(job.AssignedSitter_ID).padStart(5, '0')}`
    : 'ID: PK-—';

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={() => navigate(-1)}>
          <Icons.arrowBack />
        </div>
        <h2 style={styles.title}>Active Job</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Sitter info card */}
      <div style={styles.sitterCard}>
        <div style={styles.sitterAvatar}>
          <img
            src={buildImageUrl(sitterPic)}
            alt="Sitter"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=32'; }}
          />
        </div>
        <div>
          <p style={styles.sitterName}>{sitterName}</p>
          <p style={styles.sitterId}>{sitterIdDisplay}</p>
        </div>
        <div style={{ flex: 1 }} />
        <div style={styles.childTag}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontWeight: 600, color: '#333', marginLeft: 4 }}>
            {childName}{childAge !== null ? ` (${childAge}y)` : ''}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div style={styles.timerSection}>
        <p style={styles.timerLabel}>LIVE DURATION</p>
        <div style={styles.timerCircle}>
          <h1 style={styles.timerText}>{formatTime(elapsedSeconds)}</h1>
          <div style={styles.timerStarted}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27ae60', display: 'inline-block', marginRight: 6 }} />
            Started at {job.SlotTimes?.[0]?.StartTime?.substring(0, 5) || '?'}
          </div>
        </div>
      </div>

      {/* Details cards */}
      <div style={styles.detailsContainer}>
        <div style={styles.detailRow}>
          <div style={styles.iconBox}><Icons.location /></div>
          <div>
            <p style={styles.detailLabel}>LOCATION</p>
            <p style={styles.detailValue}>{locationText}</p>
          </div>
        </div>
        <div style={styles.detailRow}>
          <div style={styles.iconBox}><Icons.cash /></div>
          <div>
            <p style={styles.detailLabel}>PAYMENT RATE</p>
            <p style={styles.detailValue}>PKR {paymentRate}/hr</p>
          </div>
        </div>
      </div>

      {/* End Job Button */}
      <div style={styles.endBtnContainer}>
        <button
          onClick={() => setShowEndConfirm(true)}
          style={styles.endBtn}
        >
          End Job <Icons.chevronForward />
        </button>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ textAlign: 'center', marginBottom: 12 }}>End this job?</h3>
            <p style={{ textAlign: 'center', color: '#8E9AAF', marginBottom: 24 }}>
              This will complete the session and move it to history.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowEndConfirm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleEndJob} style={styles.confirmBtn}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ParentBottomNav />
    </div>
  );
};

/* Styles */
const styles = {
  screen: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)',
    paddingBottom: 100,
    fontFamily: "'Nunito', sans-serif",
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  title: { margin: 0, fontWeight: 700, fontSize: 18, color: '#2D3142' },
  sitterCard: {
    background: '#fff',
    borderRadius: 22,
    padding: '16px 20px',
    margin: '0 16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  sitterAvatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #FFF0E6',
  },
  sitterName: { margin: 0, fontWeight: 700, fontSize: 17, color: '#2D3142' },
  sitterId: { margin: 0, fontSize: 12, color: '#8E9AAF' },
  childTag: {
    display: 'flex',
    alignItems: 'center',
    background: '#F5F5F5',
    borderRadius: 18,
    padding: '6px 12px',
    fontSize: 13,
  },
  timerSection: { textAlign: 'center', marginBottom: 30 },
  timerLabel: {
    margin: '0 0 16px',
    fontSize: 12,
    fontWeight: 700,
    color: orange,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.7)',
    border: `2px solid ${orange}22`,
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  timerText: {
    margin: '0 0 8px',
    fontSize: 38,
    fontWeight: 800,
    color: '#2D3142',
    fontFamily: 'monospace',
  },
  timerStarted: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    color: '#8E9AAF',
  },
  detailsContainer: {
    padding: '0 16px',
    marginBottom: 24,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 18px',
    background: '#fff',
    borderRadius: 18,
    marginBottom: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: '#eef4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailLabel: {
    margin: '0 0 2px',
    fontSize: 10,
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: { margin: 0, fontWeight: 600, fontSize: 15, color: '#1a1a1a' },
  endBtnContainer: { padding: '0 20px' },
  endBtn: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    border: 'none',
    background: orange,
    color: '#fff',
    fontWeight: 700,
    fontSize: 17,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: `0 8px 20px rgba(232, 98, 42, 0.3)`,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
  },
  modalContent: {
    background: '#fff',
    borderRadius: '28px 28px 0 0',
    padding: '30px 24px',
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    padding: '15px',
    borderRadius: 12,
    border: '1px solid #ddd',
    background: '#fff',
    fontWeight: 600,
  },
  confirmBtn: {
    flex: 1,
    padding: '15px',
    borderRadius: 12,
    border: 'none',
    background: orange,
    color: '#fff',
    fontWeight: 700,
  },
};

export default ParentActiveJobScreen;