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
  checkmarkCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e7e34" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  location: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  star: (filled = true) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#F5A623' : 'none'} stroke={filled ? 'none' : '#CCC'} strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  callOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
};

const BabySitterDetails2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;   // full job object from MyJobsScreen (history tab)

  const [sitterRating, setSitterRating] = useState(null);
  const [review, setReview] = useState(null);

  // Calculate total hours worked from time slots
  const calculateTotalHours = () => {
    if (!job?.SlotTimes || job.SlotTimes.length === 0) return 0;
    let totalMinutes = 0;
    job.SlotTimes.forEach(slot => {
      const start = slot.StartTime; // "HH:mm:ss"
      const end = slot.EndTime;
      if (start && end) {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        totalMinutes += (eh * 60 + em) - (sh * 60 + sm);
      }
    });
    return Math.round(totalMinutes / 60);
  };

  const totalHours = calculateTotalHours();
  const totalPayment = job?.Payment ? job.Payment * totalHours : 0;

  // Fetch sitter rating (from Babysitter table)
  useEffect(() => {
    if (!job?.AssignedSitter_ID) return;
    fetch(`https://localhost:44368/api/babysitter/${job.AssignedSitter_ID}`)
      .then(res => res.json())
      .then(data => setSitterRating(data.Rating || null))
      .catch(console.error);
  }, [job]);

  // Fetch review for this job and sitter (if any)
  useEffect(() => {
    if (!job?.Job_ID || !job?.AssignedSitter_ID) return;
    fetch(`https://localhost:44368/api/reviews/${job.Job_ID}/${job.AssignedSitter_ID}`)
      .then(res => res.json())
      .then(data => setReview(data))
      .catch(() => setReview(null));
  }, [job]);

  if (!job) {
    return (
      <div style={styles.screen}>
        <p>No job details available.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const sitterName = job.SitterName || 'Sitter';
  const sitterPic = job.SitterPicture || null;
  const childName = job.ChildName || 'Child';
  const locationText = job.City || 'Not specified';
  const completedDate = job.JobDate ? new Date(job.JobDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.backBtn} onClick={() => navigate(-1)}>
            <Icons.arrowBack />
          </div>
          <h2 style={styles.title}>Service Summary</h2>
          <div style={{ width: 36 }} />
        </div>

        {/* Status Banner */}
        <div style={styles.banner}>
          <Icons.checkmarkCircle />
          <span>Service Completed on {completedDate}</span>
        </div>

        {/* Sitter Profile */}
        <div style={styles.profileRow}>
          <div style={{ flex: 1 }}>
            <h3 style={styles.sitterName}>{sitterName}</h3>
            <div style={styles.locationRow}>
              <Icons.location />
              <span>{locationText}</span>
            </div>
            <div style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <Icons.star key={i} filled={sitterRating ? i <= Math.round(sitterRating) : false} />
              ))}
              <span style={{ fontWeight: 600, marginLeft: 6 }}>
                {sitterRating ? sitterRating.toFixed(1) : '—'}
              </span>
              <span style={{ color: '#aaa', marginLeft: 4 }}>Overall Rating</span>
            </div>
          </div>
          <img
            src={buildImageUrl(sitterPic)}
            alt={sitterName}
            style={styles.avatar}
            onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=47'; }}
          />
        </div>

        {/* Contact */}
        <div style={styles.card}>
          <div style={styles.contactRow}>
            <Icons.callOutline />
            <div>
              <p style={styles.cardLabel}>CONTACTED VIA</p>
              <p style={styles.cardValue}>{job.SitterPhone || '+92 315 130 9876'}</p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={styles.cardLabel}>TOTAL HOURS WORKED</p>
              <p style={styles.cardValue}>{totalHours} Hour{totalHours !== 1 ? 's' : ''} Total</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={styles.cardLabel}>TOTAL PAID</p>
              <p style={{ ...styles.cardValue, color: orange, fontSize: 18 }}>
                PKR {totalPayment.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Review Section */}
        {review ? (
          <>
            <p style={styles.sectionTitle}>Recent Review for this Service</p>
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Icons.star key={i} filled={i <= review.Rating} />
                ))}
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#333', marginLeft: 'auto' }}>
                  {review.CreatedAt ? new Date(review.CreatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </span>
              </div>
              <p style={styles.reviewText}>"{review.Comment}"</p>
            </div>
          </>
        ) : (
          <p style={styles.sectionTitle}>No review for this service yet</p>
        )}

        {/* Service Notes (from job description) */}
        {job.Description && (
          <>
            <p style={styles.sectionTitle}>SERVICE NOTES</p>
            <div style={styles.notesCard}>
              <p style={styles.notesText}>{job.Description}</p>
            </div>
          </>
        )}
      </div>
      <ParentBottomNav />
    </div>
  );
};

const styles = {
  screen: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fce4ec 0%, #e0f2f1 100%)',
    paddingBottom: 100,
    fontFamily: "'Nunito', sans-serif",
  },
  container: { padding: '24px 20px 140px' },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  title: { margin: 0, fontSize: 22, fontWeight: 'bold', color: '#2D3142' },
  banner: {
    background: '#e6f4ea',
    color: '#1e7e34',
    padding: 12,
    borderRadius: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  sitterName: { margin: '0 0 4px', fontSize: 26, fontWeight: 'bold', color: '#111' },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    fontSize: 13,
    color: '#888',
  },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4 },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: 15,
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    marginBottom: 15,
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  cardLabel: {
    margin: '0 0 2px',
    fontSize: 10,
    color: '#aaa',
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardValue: { margin: 0, fontSize: 14, fontWeight: 600, color: '#111' },
  sectionTitle: {
    margin: '10px 0 10px 5px',
    fontSize: 11,
    fontWeight: 'bold',
    color: orange,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  reviewText: {
    margin: 0,
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  notesCard: {
    background: '#fff',
    borderRadius: 20,
    padding: 15,
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    marginBottom: 15,
  },
  notesText: {
    margin: 0,
    fontSize: 14,
    color: '#444',
    lineHeight: 1.7,
    borderLeft: `4px solid ${orange}`,
    paddingLeft: 10,
    background: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
  },
};

export default BabySitterDetails2;