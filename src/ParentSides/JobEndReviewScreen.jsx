import { useState } from 'react';
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
  star: ({ filled }) => (
    <svg width="28" height="28" viewBox="0 0 24 24"
      fill={filled ? '#F5A623' : 'none'}
      stroke={filled ? 'none' : '#CCC'}
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const JobEndReviewScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { job, elapsedSeconds, sitterId: passedSitterId, childAge: passedChildAge } = location.state || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parentId = Number(localStorage.getItem('userId'));

  // ----- Reliable sitter ID, never a string -----
  const sitterId = passedSitterId ?? job?.AssignedSitter_ID ?? null;
  const sitterIdValid = sitterId != null && sitterId > 0;

  const sitterName = job?.SitterName || 'Sitter';
  const childName = job?.ChildName || 'Child';

  // ----- Child age (use passed value first, then fallback) -----
  const childAge =
    passedChildAge ??
    job?.ChildAge ??
    (job?.Child_DOB ? calculateAge(job.Child_DOB) : null) ??
    '?';

  const startTime = job?.SlotTimes?.[0]?.StartTime?.substring(0, 5) || '?';
  const endTime = job?.SlotTimes?.[job.SlotTimes.length - 1]?.EndTime?.substring(0, 5) || '?';
  const duration = elapsedSeconds ? formatDuration(elapsedSeconds) : '?';

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }
    if (!sitterIdValid) {
      alert('Sitter information is missing. Please go back and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('https://localhost:44368/api/review/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Job_ID: job.Job_ID,
          Reviewer_ID: parentId,
          ReviewerRole: 'Parent',
          ReviewFor_ID: sitterId,
          ReviewForRole: 'Sitter',
          Rating: rating,
          Comment: comment.trim() || '',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save review');
      }

      navigate('/parent-my-jobs', { state: { openTab: 'history' } });
    } catch (err) {
      alert(err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div style={styles.centered}>
        <p>Missing job data.</p>
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
        <h2 style={styles.title}>Job Completed</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Success banner */}
      <div style={styles.banner}>
        <span style={{ fontSize: 24, marginRight: 8 }}>🎉</span>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Great job!</span>
        <span style={{ marginLeft: 8 }}>Here is your summary.</span>
      </div>

      {/* Duration */}
      <div style={styles.durationCard}>
        <p style={styles.durationText}>{duration}</p>
        <p style={styles.durationLabel}>DURATION</p>
      </div>

      {/* Sitter info */}
      <div style={styles.infoCard}>
        <p style={styles.infoLabel}>BABY SITTER</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={buildImageUrl(job.SitterPicture)}
            alt="sitter"
            style={styles.avatarSmall}
            onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=32'; }}
          />
          <div>
            <p style={styles.infoValue}>{sitterName}</p>
            <p style={styles.infoSub}>
              ID: PK-{sitterIdValid ? String(sitterId).padStart(5, '0') : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Child info */}
      <div style={styles.infoCard}>
        <p style={styles.infoLabel}>CHILD</p>
        <p style={styles.infoValue}>
          {childName} ({childAge} Year{childAge !== 1 ? 's' : ''})
        </p>
      </div>

      {/* Start / End times */}
      <div style={styles.timesRow}>
        <div style={{ flex: 1 }}>
          <p style={styles.infoLabel}>Start Time</p>
          <p style={styles.timeValue}>{startTime}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={styles.infoLabel}>End Time</p>
          <p style={styles.timeValue}>{endTime}</p>
        </div>
      </div>

      {/* Star rating */}
      <div style={styles.ratingCard}>
        <p style={styles.ratingLabel}>Rate Your Experience</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              onClick={() => setRating(i)}
              style={{ cursor: 'pointer' }}
            >
              <Icons.star filled={i <= rating} />
            </div>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your feedback about the job..."
          style={styles.textarea}
          rows={4}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || !sitterIdValid}
          style={{
            ...styles.submitBtn,
            opacity: submitting || !sitterIdValid ? 0.6 : 1,
            cursor: submitting || !sitterIdValid ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

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
  title: { margin: 0, fontWeight: 700, fontSize: 18, color: '#2D3142' },
  banner: {
    background: '#FFF9E6',
    borderRadius: 16,
    margin: '0 16px 20px',
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #F5E6B8',
  },
  durationCard: {
    background: '#fff',
    borderRadius: 20,
    margin: '0 16px 16px',
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  durationText: {
    fontSize: 32,
    fontWeight: 800,
    color: orange,
    margin: '0 0 4px',
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#888',
    letterSpacing: 1,
  },
  infoCard: {
    background: '#fff',
    borderRadius: 16,
    margin: '0 16px 12px',
    padding: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#888',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#2D3142',
    margin: 0,
  },
  infoSub: {
    fontSize: 12,
    color: '#888',
    margin: 0,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  timesRow: {
    display: 'flex',
    gap: 12,
    margin: '0 16px 20px',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#2D3142',
  },
  ratingCard: {
    background: '#fff',
    borderRadius: 20,
    margin: '0 16px',
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: '#2D3142',
    marginBottom: 12,
  },
  textarea: {
    width: '100%',
    borderRadius: 12,
    border: '1px solid #ddd',
    padding: 12,
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    border: 'none',
    background: orange,
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
  },
};

export default JobEndReviewScreen;