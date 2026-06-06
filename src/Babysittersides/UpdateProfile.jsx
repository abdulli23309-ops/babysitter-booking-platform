import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

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

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  location: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  checkmark: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  chevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  camera: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
};

const UpdateProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);

  const sitterId = Number(localStorage.getItem('userId'));

  const [form, setForm] = useState({
    fullName: '',
    cnic: '',
    dob: '',
    gender: 'Female',
    professionalTitle: '',
    preferredChildAge: 'Toddlers (1-4 years)',
    chargesPerHour: '',
    location: '',
    fullAddress: '',
    contactNo: '',
    experienceSummary: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`api/matching/babysitter/${sitterId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setOriginalProfile(data);
        setForm({
          fullName: data.FullName || '',
          cnic: data.CNIC || '',
          dob: data.DOB ? data.DOB.split('T')[0] : '',
          gender: data.Gender || 'Female',
          professionalTitle: data.ProfessionalTitle || '',
          preferredChildAge: data.PreferredChildAge || 'Toddlers (1-4 years)',
          chargesPerHour: data.HourlyRate ? data.HourlyRate.toString() : '',
          location: data.City || '',
          fullAddress: data.Address || '',
          contactNo: data.PhoneNumber || '',
          experienceSummary: data.Bio || '',
        });
        setProfileImage(buildImageUrl(data.PictureAddress));
      } catch (err) {
        console.error(err);
        setMessage('Could not load profile.');
      }
    };
    if (sitterId) fetchProfile();
  }, [sitterId]);

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
    window._updateProfileFile = file;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    const fd = new FormData();
    fd.append('FullName', form.fullName);
    fd.append('CNIC', form.cnic);
    fd.append('DOB', form.dob);
    fd.append('Gender', form.gender);
    fd.append('ProfessionalTitle', form.professionalTitle);
    fd.append('PreferredChildAge', form.preferredChildAge);
    fd.append('HourlyRate', form.chargesPerHour);
    fd.append('City', form.location);
    fd.append('Address', form.fullAddress);
    fd.append('PhoneNumber', form.contactNo);
    fd.append('ExperienceSummary', form.experienceSummary);

    if (window._updateProfileFile) {
      fd.append('ProfilePicture', window._updateProfileFile);
    } else if (originalProfile?.PictureAddress) {
      fd.append('ExistingPicture', originalProfile.PictureAddress);
    } else {
      fd.append('UseDefaultPicture', 'true');
    }

    try {
      const res = await fetch(`api/babysitter/update/${sitterId}`, {
        method: 'PUT',
        body: fd,
      });
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => navigate('/my-profile'), 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || 'Update failed');
      }
    } catch {
      setMessage('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fce4ec 0%, #e8eaf6 50%, #e0f2f1 100%)', paddingBottom: '100px' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".jpg,.jpeg,.png" onChange={handleFileChange} />

      <div style={{ padding: '20px 20px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', marginRight: '14px' }}>
            <Icons.arrowBack />
          </div>
          <h2 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#1a1a1a' }}>Update Profile</h2>
        </div>

        {/* Avatar section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden',
              border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={profileImage || 'https://i.pravatar.cc/100?img=47'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div onClick={handleImageClick} style={{
              position: 'absolute', bottom: 2, right: 2, width: 28, height: 28,
              borderRadius: '50%', background: orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,98,42,0.4)',
            }}>
              <Icons.camera />
            </div>
          </div>
          <div>
            <button onClick={handleImageClick} style={{
              background: '#ffe0cc', color: orange, border: 'none', borderRadius: '20px',
              padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
            }}>Upload Photo</button>
          </div>
        </div>

        {/* Verified Info */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#222' }}>Verified Personal Information</span>
          </div>

          <CardField label="FULL NAME" value={form.fullName} onChange={(v) => handleChange('fullName', v)} locked />
          <CardField label="CNIC / ID NUMBER" value={form.cnic} onChange={(v) => handleChange('cnic', v)} locked />
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <CardField label="DOB" type="date" value={form.dob} onChange={(v) => handleChange('dob', v)} locked />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>GENDER</label>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <span style={{ fontSize: '14px', color: '#333' }}>{form.gender}</span>
                <Icons.lock />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Experience */}
        <SectionHeader icon="📝" title="Professional Experience" />
        <InputField label="PROFESSIONAL TITLE" value={form.professionalTitle} onChange={(v) => handleChange('professionalTitle', v)} />
        <label style={labelStyle}>PREFERRED CHILD AGE</label>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <select value={form.preferredChildAge} onChange={(e) => handleChange('preferredChildAge', e.target.value)} style={{ ...inputStyle, marginBottom: 0, appearance: 'none', paddingRight: '40px', cursor: 'pointer' }}>
            <option>Toddlers (1-4 years)</option>
            <option>Infants (0-1 year)</option>
            <option>Kids (4-8 years)</option>
            <option>Pre-teens (8-12 years)</option>
          </select>
          <Icons.chevronDown style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
        <InputField label="CHARGES PER HOUR (PKR)" type="number" value={form.chargesPerHour} onChange={(v) => handleChange('chargesPerHour', v)} />
        <div style={{ position: 'relative' }}>
          <InputField label="LOCATION" value={form.location} onChange={(v) => handleChange('location', v)} />
          <Icons.location style={{ position: 'absolute', right: '14px', top: '40px', transform: 'translateY(-50%)' }} />
        </div>
        <InputField label="FULL ADDRESS" value={form.fullAddress} onChange={(v) => handleChange('fullAddress', v)} />
        <InputField label="CONTACT NO" type="tel" value={form.contactNo} onChange={(v) => handleChange('contactNo', v)} />
        <label style={labelStyle}>EXPERIENCE SUMMARY</label>
        <textarea
          style={{ ...inputStyle, height: '120px', resize: 'none', verticalAlign: 'top', fontFamily: 'inherit', lineHeight: '1.5' }}
          value={form.experienceSummary}
          onChange={(e) => handleChange('experienceSummary', e.target.value)}
        />

        {message && <p style={{ color: message.includes('success') ? '#27ae60' : '#e74c3c', textAlign: 'center', margin: '10px 0' }}>{message}</p>}

        <button onClick={handleSave} disabled={loading} style={{
          width: '100%', padding: '16px', borderRadius: '30px',
          background: 'linear-gradient(to right, #ff9800, #f57c00)',
          color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginTop: '20px',
        }}>
          <Icons.checkmark /> Update Profile
        </button>
      </div>
      <BabysitterBottomNav />
    </div>
  );
};

// Reusable fields
const CardField = ({ label, value, onChange, type = 'text', locked }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={cardStyle}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#333', flex: 1, background: 'transparent' }} />
      {locked && <Icons.lock />}
    </div>
  </div>
);

const InputField = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', marginTop: '16px' }}>
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#222' }}>{title}</h3>
  </div>
);

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '13px 15px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: '1px solid #f0f0f0',
};

const inputStyle = {
  width: '100%',
  background: '#ffffff',
  borderRadius: '16px',
  padding: '13px 15px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '12px',
  border: '1px solid #f0f0f0',
  fontSize: '14px',
  color: '#333',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#ff6a00',
  letterSpacing: '0.8px',
  marginBottom: '6px',
  marginTop: '4px',
};

export default UpdateProfile;