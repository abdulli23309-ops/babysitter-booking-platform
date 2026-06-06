import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

const Icons = {
  arrowBack: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  camera: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  calendarOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  saveOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
  ),
};

const UpdateChildProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const childData = location.state?.child;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = { current: null };

  const [form, setForm] = useState({
    childName: '',
    dob: '',
    gender: 'Male',
    specialNote: '',
    guardianName: '',
    guardianPhone: '',
  });

  // Prefill form when child data is available
  useEffect(() => {
    if (childData) {
      setForm({
        childName: childData.ChildName || '',
        dob: childData.DOB ? childData.DOB.split('T')[0] : '',
        gender: childData.Gender || 'Male',
        specialNote: childData.SpecialRequirements || '',
        guardianName: 'Muhammad Ali',   // placeholder; replace with real data
        guardianPhone: '0319XXXXXXX',
      });
      setProfileImage(childData.PictureAddress || null);
    }
  }, [childData]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setMessage('Only JPG/PNG images allowed');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      setMessage('');
    };
    reader.readAsDataURL(file);
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix';
    if (path.startsWith('http')) return path;
    return `/Images/${path}`;
  };

  const handleSave = async () => {
    if (!form.childName.trim()) {
      setMessage('Please enter child name');
      return;
    }
    setLoading(true);
    setMessage('');
    const payload = {
      ChildName: form.childName.trim(),
      DOB: form.dob,
      Gender: form.gender,
      SpecialRequirements: form.specialNote || null,
      PictureAddress: profileImage || null,
    };

    try {
      const res = await fetch(`/api/parent/child/${childData.Child_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage('Profile updated!');
        setTimeout(() => navigate('/child-profile'), 1000);
      } else {
        const data = await res.json();
        setMessage(data.message || 'Update failed');
      }
    } catch (err) {
      setMessage('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!childData) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>No child data found.</p>
        <button onClick={() => navigate('/child-profile')} style={{ marginLeft: '10px', padding: '10px 20px', borderRadius: '20px', background: orange, color: '#fff', border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)', paddingBottom: '120px' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".jpg,.jpeg,.png" onChange={handleFileChange} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px 10px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer', marginLeft: '10px' }}>
          <Icons.arrowBack />
        </div>
        <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontWeight: '700', fontSize: '20px', color: '#2D3142', marginRight: '46px' }}>Update Profile</h2>
      </div>

      {/* Form Card */}
      <div style={{ background: '#ffffff', borderRadius: '40px', padding: '24px', margin: '80px 15px 20px 15px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'relative' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '5px solid #fff', position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <img src={profileImage ? getImageUrl(profileImage) : 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'} alt="child" style={{ borderRadius: '50%', width: '100%', height: '100%', objectFit: 'cover' }} />
          <div onClick={handleImageClick} style={{ position: 'absolute', bottom: '5px', right: '5px', background: orange, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', border: '2px solid #fff', cursor: 'pointer' }}>
            <Icons.camera />
          </div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#8E9AAF', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Child Name</span>
          <div style={{ background: '#F7F9FC', borderRadius: '12px', marginBottom: '16px', padding: '4px 12px', border: '1px solid #F0F4F8' }}>
            <input type="text" value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} style={{ width: '100%', padding: '12px 0', border: 'none', background: 'transparent', fontSize: '14px', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#8E9AAF', display: 'block', marginBottom: '6px' }}>DOB</span>
              <div style={{ background: '#F7F9FC', borderRadius: '12px', marginBottom: '16px', padding: '10px 12px', border: '1px solid #F0F4F8', display: 'flex', alignItems: 'center' }}>
                <Icons.calendarOutline />
                <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} style={{ marginLeft: '10px', border: 'none', background: 'transparent', fontSize: '14px', outline: 'none', flex: 1 }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#8E9AAF', display: 'block', marginBottom: '6px' }}>Gender</span>
              <div style={{ background: '#F7F9FC', borderRadius: '12px', marginBottom: '16px', padding: '4px 12px', border: '1px solid #F0F4F8' }}>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={{ width: '100%', padding: '12px 0', border: 'none', background: 'transparent', fontSize: '14px', outline: 'none' }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <span style={{ fontSize: '12px', fontWeight: '700', color: '#8E9AAF', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Special Note</span>
          <div style={{ background: '#F7F9FC', borderRadius: '12px', marginBottom: '16px', padding: '4px 12px', border: '1px solid #F0F4F8', height: '80px' }}>
            <textarea value={form.specialNote} onChange={(e) => setForm({ ...form, specialNote: e.target.value })} style={{ width: '100%', height: '100%', padding: '12px 0', border: 'none', background: 'transparent', fontSize: '14px', outline: 'none', resize: 'none' }} />
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: '800', color: orange, margin: '20px 0 10px', letterSpacing: '1px' }}>GUARDIAN DETAILS</h3>
          <div style={{ background: '#F7F9FC', borderRadius: '12px', marginBottom: '16px', padding: '4px 12px', border: '1px solid #F0F4F8' }}>
            <input type="text" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} placeholder="Guardian Name" style={{ width: '100%', padding: '12px 0', border: 'none', background: 'transparent', fontSize: '14px', outline: 'none' }} />
          </div>
          <div style={{ background: '#F7F9FC', borderRadius: '12px', marginBottom: '16px', padding: '4px 12px', border: '1px solid #F0F4F8' }}>
            <input type="text" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="Guardian Phone" style={{ width: '100%', padding: '12px 0', border: 'none', background: 'transparent', fontSize: '14px', outline: 'none' }} />
          </div>

          {message && <p style={{ color: message.includes('updated') ? '#27ae60' : '#e74c3c', textAlign: 'center', margin: '10px 0' }}>{message}</p>}
        </div>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '20px', background: orange, color: '#fff', border: 'none', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(232,98,42,0.3)' }}>
          <Icons.saveOutline /> {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </div>

      <ParentBottomNav />
    </div>
  );
};

export default UpdateChildProfileScreen;