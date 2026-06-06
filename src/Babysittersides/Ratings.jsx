import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

/* ── Star icons ── */
const Icons = {
  star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFC107" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  starHalf: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC107" strokeWidth="2">
      <path d="M12 2v17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FFC107" />
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77" fill="none" />
    </svg>
  ),
  starOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC107" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
};

/* ── Helper: render star rating ── */
const StarRating = ({ rating, size = 20 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Icons.star key={i} />);
    } else if (i - rating < 1) {
      stars.push(<Icons.starHalf key={i} />);
    } else {
      stars.push(<Icons.starOutline key={i} />);
    }
  }
  return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
};

/* ── Generate initials from name ── */
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

/* ── Random background color for avatar placeholder ── */
const avatarColors = ['#fce4ec', '#e3f2fd', '#f3e5f5', '#e8f5e9', '#fff3e0'];
const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

const Ratings = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const sitterId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/review/user/${sitterId}/Sitter`);
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        setReviews(data);

        // Calculate average rating
        if (data.length > 0) {
          const total = data.reduce((sum, r) => sum + r.Rating, 0);
          setAvgRating(total / data.length);
        } else {
          setAvgRating(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (sitterId) fetchReviews();
    else setLoading(false);
  }, [sitterId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f5c6d6, #b2d8d8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading ratings…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f5c6d6, #b2d8d8)', paddingBottom: '100px' }}>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div
            onClick={() => navigate(-1)}
            style={{
              background: '#fff', borderRadius: '50%', width: 45, height: 45,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer',
            }}
          >
            <Icons.arrowBack />
          </div>
          <h2 style={{ marginLeft: '15px' }}>Ratings & Reviews</h2>
        </div>

        {/* Overall Rating Card */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', marginBottom: '20px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '52px', fontWeight: 'bold', color: '#111' }}>
            {avgRating.toFixed(2)}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <StarRating rating={avgRating} size={28} />
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#ff6a00', fontWeight: '600' }}>
            Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Recent Reviews */}
        <h3 style={{ margin: '0 0 14px', fontSize: '18px', fontWeight: 'bold', color: '#111' }}>Recent Reviews</h3>

        {reviews.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 40, color: '#bbb' }}>No reviews yet.</div>
        )}

        {reviews.map((rev, index) => (
          <div
            key={index}
            style={{
              background: '#fff', borderRadius: '20px', padding: '20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)', marginBottom: '15px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Avatar placeholder */}
                <div
                  style={{
                    width: '45px', height: '45px', borderRadius: '50%',
                    background: getAvatarColor(index),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '14px', color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(rev.ReviewerName)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111' }}>
                    {rev.ReviewerName || 'Anonymous'}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#aaa' }}>
                    {new Date(rev.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <StarRating rating={rev.Rating} size={16} />
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
              {rev.Comment}
            </p>
          </div>
        ))}
      </div>

      <BabysitterBottomNav />
    </div>
  );
};

export default Ratings;