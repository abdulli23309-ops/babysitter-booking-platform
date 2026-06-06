import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

// ---------- Helper: Convert image path to API URL ----------
const buildImageUrl = (pic) => {
  if (!pic) return null;
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `https://localhost:44368/api/images/${type}/${filename}`;
  }
  return `https://localhost:44368/api/images/default/${pic}`;
};

// ---------- SVG Icons ----------
const Icons = {
  arrowBack: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  location: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  createOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  person: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  happy: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  options: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
};

const ParentProfileScreen = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setUserData(JSON.parse(userStr));
    } catch (e) {
      console.error('Failed to parse user data', e);
    }
  }, []);

  const parentName = userData?.name || userData?.FullName || 'Parent';
  const parentPhone = userData?.phoneNumber || userData?.PhoneNumber || '+92 300 1234567';
  const parentCity = userData?.address || userData?.Address || 'Islamabad';
  const parentPic = userData?.pictureAddress || userData?.PictureAddress || null;
  const avatarUrl = buildImageUrl(parentPic) || 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=200';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f9cfe0 0%, #e8d6f0 40%, #ccd8f5 100%)', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Icons.arrowBack />
        </button>
        <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontWeight: '800', fontSize: '20px', color: '#1a1a1a' }}>My Profile</h2>
        <div style={{ width: '48px' }} />
      </div>

      {/* Profile Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={avatarUrl} alt={parentName} style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fff', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=200'; }} />
          <div style={{ position: 'absolute', bottom: '0', right: '0', background: orange, color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid #fff' }}>
            <Icons.createOutline />
          </div>
        </div>
        <h2 style={{ margin: '12px 0 4px 0', fontWeight: '800', color: '#2D3142' }}>{parentName}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px' }}>
          <Icons.location />
          {parentCity}, Pakistan
        </div>
      </div>

      {/* Personal Details */}
      <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '20px', margin: '0 20px 15px 20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', fontWeight: 'bold', fontSize: '18px', color: '#2D3142' }}>
          <div style={{ background: '#fff5ef', color: orange, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Icons.person /></div>
          Personal Details
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}><span style={{ color: '#888' }}>Full Name</span><span style={{ fontWeight: '600', color: '#2D3142' }}>{parentName}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}><span style={{ color: '#888' }}>City</span><span style={{ fontWeight: '600', color: '#2D3142' }}>{parentCity}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><span style={{ color: '#888' }}>Phone</span><span style={{ fontWeight: '600', color: '#2D3142' }}>{parentPhone}</span></div>
      </div>

      {/* My Children */}
      <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '20px', margin: '0 20px 15px 20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', fontWeight: 'bold', fontSize: '18px', color: '#2D3142' }}>
          <div style={{ background: '#fff5ef', color: orange, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Icons.happy /></div>
          My Children
        </div>
        <div style={{ background: 'rgba(247,249,252,0.8)', borderRadius: '12px', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><span style={{ fontWeight: '600', color: '#2D3142' }}>Hamza Ahmed</span><span style={{ background: orange, color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>4 Years</span></div>
        <div style={{ background: 'rgba(247,249,252,0.8)', borderRadius: '12px', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: '600', color: '#2D3142' }}>Ayesha Malik</span><span style={{ background: orange, color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>2 Years</span></div>
      </div>

      {/* Preferences */}
      <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '20px', margin: '0 20px 15px 20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', fontWeight: 'bold', fontSize: '18px', color: '#2D3142' }}>
          <div style={{ background: '#fff5ef', color: orange, width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Icons.options /></div>
          Preferences
        </div>
        <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px 0' }}>Preferred Location</p>
        <p style={{ fontWeight: '600', color: '#2D3142', margin: '0 0 15px 0' }}>DHA Phase 6, Islamabad</p>
        <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px 0' }}>Special Instructions</p>
        <p style={{ fontWeight: '600', color: '#ff4d4d', margin: 0 }}>Allergic to peanuts.</p>
      </div>

      {/* Update Button */}
      <div style={{ padding: '10px 20px 40px 20px' }}>
        <button onClick={() => navigate('/update-parent-profile')} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: orange, color: '#fff', border: 'none', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: `0 10px 30px rgba(232,98,42,0.3)` }}>
          <Icons.createOutline /> Update Profile
        </button>
      </div>

      <ParentBottomNav />
    </div>
  );
};

export default ParentProfileScreen;