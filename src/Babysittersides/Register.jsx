import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    experience: '',
    hourlyRate: '',
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setMessage('Only JPG/PNG images are allowed');
      return;
    }
    setProfileImage(URL.createObjectURL(file));
    window._sitterProfileFile = file;
    setMessage('');
  };

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setMessage('Please fill all required fields (*)');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('Registering...');

    const fd = new FormData();
    fd.append('FullName', form.fullName);
    fd.append('EmailAddress', form.email);
    fd.append('Username', form.email.split('@')[0]);
    fd.append('Password', form.password);
    fd.append('PhoneNumber', form.phone);
    fd.append('DOB', form.dob || '2000-01-01');
    fd.append('ExperienceYears', form.experience || '0');
    fd.append('HourlyRate', form.hourlyRate || '0');

    if (window._sitterProfileFile) {
      fd.append('ProfilePicture', window._sitterProfileFile);
    } else {
      fd.append('UseDefaultPicture', 'true');
    }

    try {
      const res = await fetch('/api/babysitter/register', {
        method: 'POST',
        body: fd,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = text || 'Unknown error';
      }

      if (res.ok) {
        setMessage('Registration Successful ✅');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      } else {
        setMessage(
          typeof data === 'string' ? data : data?.message || data?.Message || 'Registration Failed'
        );
      }
    } catch (err) {
      console.error(err);
      setMessage('Server connection failed ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".jpg,.jpeg,.png" onChange={handleFileChange} />

      <div style={styles.card}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
        <h2 style={styles.title}>Registration</h2>
        <p style={styles.subtitle}>Join our trusted sitter community</p>

        <div style={styles.imageContainer} onClick={handleImageClick}>
          <div style={styles.imageWrapper}>
            {profileImage ? <img src={profileImage} alt="Profile" style={styles.image} /> : <div style={styles.placeholderIcon}>📷</div>}
          </div>
          <div style={styles.cameraBadge}>📸</div>
        </div>

        <div style={styles.formScroll}>
          <InputField label="Full Name" placeholder="e.g. Sarah Jenkins" value={form.fullName} onChange={(v) => handleChange('fullName', v)} required />
          <InputField label="Email Address" type="email" placeholder="example@mail.com" value={form.email} onChange={(v) => handleChange('email', v)} required />
          <InputField label="Password" type="password" placeholder="Enter your password" value={form.password} onChange={(v) => handleChange('password', v)} required />
          <InputField label="Confirm Password" type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={(v) => handleChange('confirmPassword', v)} required />
          <InputField label="Phone Number" placeholder="+92 3XX XXXXXXXX" value={form.phone} onChange={(v) => handleChange('phone', v)} />
          <InputField label="Date of Birth" type="date" value={form.dob} onChange={(v) => handleChange('dob', v)} />
          <InputField label="Experience (years)" type="number" placeholder="e.g. 3" value={form.experience} onChange={(v) => handleChange('experience', v)} />
          <InputField label="Hourly Rate (PKR)" type="number" placeholder="e.g. 500" value={form.hourlyRate} onChange={(v) => handleChange('hourlyRate', v)} />
        </div>

        {message && (
          <p style={message.includes('✅') ? styles.successMsg : styles.errorMsg}>
            {message}
          </p>
        )}

        <button onClick={handleRegister} disabled={loading} style={styles.button}>
          {loading ? 'Registering...' : 'Register as Sitter'}
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, type = 'text', placeholder, value, onChange, required }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>
      {label}
      {required && <span style={{ color: 'red' }}> *</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.input}
    />
  </div>
);

const styles = {
  page: { minHeight: '100vh', background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  card: { background: '#fff', borderRadius: '25px', padding: '24px 20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
  title: { textAlign: 'center', marginBottom: '4px', color: '#222', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '14px' },
  formScroll: { flex: 1, overflowY: 'auto', paddingRight: '4px' },
  imageContainer: { display: 'flex', justifyContent: 'center', marginBottom: '20px', position: 'relative', cursor: 'pointer' },
  imageWrapper: { width: '100px', height: '100px', borderRadius: '50%', background: '#FFF5F0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderIcon: { fontSize: '40px', color: '#FF7A00' },
  cameraBadge: { position: 'absolute', bottom: '5px', right: 'calc(50% - 45px)', background: '#FF7A00', borderRadius: '50%', padding: '5px', fontSize: '14px', color: '#fff', border: '2px solid #fff' },
  inputGroup: { marginBottom: '16px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#FF7A00', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  backButton: { background: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '24px', color: '#FF7A00', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 },
  button: { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: '#FF7A00', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '16px', transition: 'background 0.2s' },
  errorMsg: { color: '#e74c3c', textAlign: 'center', margin: '8px 0', fontSize: '13px' },
  successMsg: { color: '#27ae60', textAlign: 'center', margin: '8px 0', fontSize: '13px' },
};

export default Register;