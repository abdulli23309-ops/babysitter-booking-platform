import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1D2E" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  camera: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  save: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
};

const calculateAge = (dobString) => {
  if (!dobString) return '';
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const SetChildProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    childName: '',
    dob: '',
    gender: '',
    specialNote: '',
    guardianName: '',
    guardianRelation: 'Father',
    guardianContact: '',
  });

  // Derived age from DOB
  const age = form.dob ? calculateAge(form.dob) : '';

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setMessage('Only JPG/PNG images allowed');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setProfileImage(reader.result); setMessage(''); };
    reader.readAsDataURL(file);
    // Store the actual file for upload
    window._childProfileFile = file;
  };

  const handleSave = async () => {
    if (!form.childName.trim()) { setMessage('Please enter child name'); return; }
    setLoading(true);
    setMessage('');

    const parentId = Number(localStorage.getItem('userId'));
    const fd = new FormData();
    fd.append('ParentId', parentId);
    fd.append('ChildName', form.childName.trim());
    fd.append('DOB', form.dob || '2023-01-01');
    fd.append('Gender', form.gender || 'Male');
    fd.append('SpecialRequirements', form.specialNote || '');
    fd.append('GuardianName', form.guardianName || '');
    fd.append('GuardianRelation', form.guardianRelation || 'Father');
    fd.append('GuardianContact', form.guardianContact || '');

    if (window._childProfileFile) {
      fd.append('ProfilePicture', window._childProfileFile);
    } else {
      fd.append('UseDefaultPicture', 'true');
    }

    try {
      const res = await fetch('/api/parent/child', {
        method: 'POST',
        body: fd,
      });
      if (res.ok) {
        setMessage('Child profile saved!');
        setTimeout(() => navigate('/child-job-profile'), 1000);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || 'Failed to save');
      }
    } catch {
      setMessage('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)', paddingBottom: '110px', fontFamily: "'Nunito', sans-serif" }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".jpg,.jpeg,.png" onChange={handleFileChange} />

      {/* Header */}
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Icons.arrowBack />
        </button>
        <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: 18, fontWeight: 800, color: '#1A1D2E', letterSpacing: '-0.3px' }}>Set Child Profile</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', position: 'relative' }}>
          <img
            src={profileImage || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            alt="child"
          />
          <div onClick={handleImageClick} style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, background: orange, borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,98,42,0.4)' }}>
            <Icons.camera />
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 32, margin: '12px 14px 0', padding: '20px 18px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>

        <span style={labelStyle}>Child Name</span>
        <div style={fieldStyle}>
          <input style={inputStyle} type="text" placeholder="Enter full name" value={form.childName} onChange={e => setForm({ ...form, childName: e.target.value })} />
        </div>

        <span style={labelStyle}>Date of Birth</span>
        <div style={fieldStyle}>
          <Icons.calendar />
          <input style={inputStyle} type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
        </div>

        <span style={labelStyle}>Age (auto‑calculated)</span>
        <div style={{ ...fieldStyle, background: '#F0F0F0' }}>
          <input style={{ ...inputStyle, color: '#555' }} type="text" value={age ? `${age} years` : ''} readOnly disabled />
        </div>

        {/* Gender */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <span style={labelStyle}>Gender</span>
            <div style={fieldStyle}>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        <span style={labelStyle}>Special Note</span>
        <div style={{ ...fieldStyle, alignItems: 'flex-start', paddingTop: 12, paddingBottom: 12, minHeight: 72 }}>
          <textarea style={{ ...inputStyle, padding: 0, resize: 'none', minHeight: 48, lineHeight: 1.5 }} placeholder="Allergies, favorite games, bedtime routine..." value={form.specialNote} onChange={e => setForm({ ...form, specialNote: e.target.value })} />
        </div>

        {/* Guardian Details */}
        <span style={{ ...labelStyle, marginTop: 16 }}>Guardian Details</span>
        <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#8E9AAF', display: 'block', marginBottom: 5 }}>Name</span>
            <div style={fieldStyle}>
              <input style={inputStyle} type="text" placeholder="Muhammad Ali" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#8E9AAF', display: 'block', marginBottom: 5 }}>Relation</span>
            <div style={fieldStyle}>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.guardianRelation} onChange={e => setForm({ ...form, guardianRelation: e.target.value })}>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
          </div>
        </div>

        <span style={labelStyle}>Guardian Contact No</span>
        <div style={fieldStyle}>
          <input style={inputStyle} type="tel" placeholder="0319XXXXXXX" value={form.guardianContact} onChange={e => setForm({ ...form, guardianContact: e.target.value })} />
        </div>

        {message && (
          <p style={{ color: message.includes('saved') ? '#27ae60' : '#e74c3c', textAlign: 'center', margin: '12px 0 0', fontSize: 13, fontWeight: 700 }}>{message}</p>
        )}
      </div>

      {/* Save Button */}
      <div style={{ padding: '14px 14px 0' }}>
        <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: 18, background: orange, color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 8px 24px rgba(232,98,42,0.35)', letterSpacing: '0.2px' }}>
          <Icons.save /> {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <ParentBottomNav />
    </div>
  );
};

const fieldStyle = {
  background: '#F7F9FC',
  borderRadius: '12px',
  border: '1.5px solid #F0F4F8',
  padding: '0 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
};

const inputStyle = {
  flex: 1,
  padding: '12px 0',
  border: 'none',
  background: 'transparent',
  fontSize: '14px',
  fontWeight: '600',
  color: '#1A1D2E',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: '800',
  color: '#8E9AAF',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '6px',
  marginTop: '14px',
};

export default SetChildProfile;