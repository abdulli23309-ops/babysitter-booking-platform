import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

/* ── Helper to build image URL ── */
const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `api/images/${type}/${filename}`;
  }
  return `api/images/default/${pic}`;
};

/* ── SVG Icons ── */
const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  locationOutline: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  personOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  briefcaseOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  timeOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={orange} stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  starOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  starHalf: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M12 2v17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={orange} />
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77" fill="none" />
    </svg>
  ),
  pencilOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

/* ── Star Rating Component ── */
const StarRating = ({ rating, max = 5 }) => {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      stars.push(<Icons.star key={i} />);
    } else if (rating >= i - 0.5) {
      stars.push(<Icons.starHalf key={i} />);
    } else {
      stars.push(<Icons.starOutline key={i} />);
    }
  }
  return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
};

/* ── Card Wrapper ── */
const Card = ({ children }) => (
  <div style={{
    background: '#fff',
    borderRadius: '20px',
    padding: '18px 20px',
    marginBottom: '14px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  }}>
    {children}
  </div>
);

/* ── Section Title ── */
const SectionTitle = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
    <div style={{
      width: '34px', height: '34px', borderRadius: '10px',
      background: '#fff5ef',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon === 'personOutline' ? <Icons.personOutline /> :
       icon === 'briefcaseOutline' ? <Icons.briefcaseOutline /> :
       icon === 'timeOutline' ? <Icons.timeOutline /> :
       null}
    </div>
    <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>{label}</span>
  </div>
);

/* ── Row ── */
const Row = ({ label, value, valueColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
    <span style={{ fontSize: '13.5px', color: '#999' }}>{label}</span>
    <span style={{ fontSize: '13.5px', fontWeight: '500', color: valueColor || '#1a1a1a' }}>{value}</span>
  </div>
);

const MyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const sitterId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch full babysitter details from matching/babysitter/{id}
        const res = await fetch(`https://localhost:44368/api/matching/babysitter/${sitterId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        // fallback to localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            setProfile(JSON.parse(stored));
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    };

    if (sitterId) fetchProfile();
    else setLoading(false);
  }, [sitterId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f5c6d6 0%, #cdd8e8 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f5c6d6 0%, #cdd8e8 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <p>Profile not found.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  // Compute age if DOB is present
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const fullName = profile.FullName || profile.name || 'Babysitter';
  const city = profile.City || profile.city || 'Islamabad';
  const phone = profile.PhoneNumber || profile.phoneNumber || 'N/A';
  const avatarUrl = buildImageUrl(profile.PictureAddress || profile.pictureAddress);
  const age = profile.DOB ? calculateAge(profile.DOB) : 'N/A';
  const experience = profile.ExperienceYears != null ? `${profile.ExperienceYears} Years` : 'N/A';
  const hourlyRate = profile.HourlyRate != null ? `Rs. ${profile.HourlyRate}/hour` : 'N/A';
  const rating = profile.Rating || 0;
  const specialization = profile.Specialization || 'Toddler (1-3 Years)'; // if available

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f5c6d6 0%, #cdd8e8 100%)', paddingBottom: '130px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '18px 20px 10px', position: 'relative',
      }}>
        <div
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', left: '20px',
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          <Icons.arrowBack />
        </div>
        <h2 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#1a1a1a' }}>
          My Profile
        </h2>
      </div>

      {/* Avatar + Name */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '16px 24px 24px',
        gap: '18px',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            overflow: 'hidden', border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            background: '#2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={avatarUrl}
              alt={fullName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          {/* Verified badge */}
          <div style={{
            position: 'absolute', bottom: '2px', right: '2px',
            width: '22px', height: '22px', borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path d="M1 4.5L4.5 8L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div>
          <h2 style={{ margin: '0 0 6px', fontWeight: '700', fontSize: '22px', color: '#1a1a1a' }}>
            {fullName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icons.locationOutline />
            <span style={{ fontSize: '13px', color: '#666' }}>{city}</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 16px' }}>
        {/* Personal Details */}
        <Card>
          <SectionTitle icon="personOutline" label="Personal Details" />
          <Row label="Full Name" value={fullName} />
          <Row label="Age" value={`${age} Years`} />
          <Row label="City" value={city} />
          <Row label="Contact no" value={phone} />
        </Card>

        {/* Professional */}
        <Card>
          <SectionTitle icon="briefcaseOutline" label="Professional" />
          <Row label="Experience" value={experience} />
          <Row label="Specialization" value={specialization} />
        </Card>

        {/* Preferences */}
        <Card>
          <SectionTitle icon="timeOutline" label="Preferences" />
          <Row label="Hourly Rate" value={hourlyRate} valueColor={orange} />
        </Card>

        {/* Rating */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionTitle icon="starOutline" label="Rating" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <StarRating rating={rating} />
              <span style={{ fontSize: '12px', color: '#999' }}>{rating.toFixed(1)} out of 5</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Update Profile Button */}
      <div style={{
        position: 'fixed', bottom: '58px', left: 0, right: 0,
        padding: '0 20px', zIndex: 150,
        background: 'linear-gradient(to top, rgba(205,216,232,0.95) 70%, transparent)',
        paddingTop: '20px', paddingBottom: '10px',
      }}>
        <button
          onClick={() => navigate('/update-profile')}
          style={{
            width: '100%', padding: '17px',
            borderRadius: '40px',
            background: orange, color: '#fff',
            border: 'none', fontWeight: '700', fontSize: '16px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 6px 18px rgba(232,98,42,0.4)',
          }}
        >
          <Icons.pencilOutline />
          Update Profile
        </button>
      </div>

      <BabysitterBottomNav />
    </div>
  );
};

export default MyProfile;