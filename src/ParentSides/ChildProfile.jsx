import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

const Icons = {
  arrowBack: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  createOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  addOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  ),
  calendarOutline: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  maleFemaleOutline: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="4"/><path d="M12 9v4M8 17v2h8v-2"/></svg>
  ),
  alertCircleOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
};

const ChildProfile = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parentId = Number(localStorage.getItem('userId'));

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getImageUrl = (path) => {
    if (!path) return `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`;
    if (path.startsWith('http')) return path;
    return `https://localhost:44368/Images/${path}`;
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://localhost:44368/api/parent/children/${parentId}`);
      if (!response.ok) throw new Error('Failed to load children');
      const data = await response.json();
      setChildren(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load children');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChild = (child) => {
    navigate('/update-child-profile', { state: { child } });
  };

  const handleAddChild = () => {
    navigate('/set-child-profile');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ padding: '20px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: orange, cursor: 'pointer', fontSize: '24px' }}>
          <Icons.arrowBack />
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>My Children</h2>
        <div style={{ width: '48px' }} />
      </div>

      {/* Add Child Button */}
      <div style={{ padding: '0 16px', marginBottom: '20px' }}>
        <button onClick={handleAddChild} style={{ width: '100%', padding: '14px', borderRadius: '30px', background: orange, color: '#fff', border: 'none', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
          <Icons.addOutline /> Add New Child
        </button>
      </div>

      {/* Children List */}
      {children.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p>You haven't added any children yet.</p>
          <p>Tap "Add New Child" to get started.</p>
        </div>
      )}

      {children.map((child) => (
        <div key={child.Child_ID} style={{ background: '#fff', borderRadius: '28px', padding: '20px', margin: '0 16px 20px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <img src={getImageUrl(child.PictureAddress)} alt={child.ChildName} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#111' }}>{child.ChildName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#666', fontSize: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.calendarOutline /> {calculateAge(child.DOB)} yrs</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.maleFemaleOutline /> {child.Gender}</span>
              </div>
            </div>
            <button onClick={() => handleEditChild(child)} style={{ background: 'transparent', border: 'none', color: orange, cursor: 'pointer' }}>
              <Icons.createOutline />
            </button>
          </div>
          {child.SpecialRequirements && child.SpecialRequirements !== 'None' && (
            <div style={{ background: '#FFF3E0', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Icons.alertCircleOutline />
              <span style={{ fontSize: '13px', color: '#333' }}>{child.SpecialRequirements}</span>
            </div>
          )}
        </div>
      ))}

      <ParentBottomNav />
    </div>
  );
};

export default ChildProfile;