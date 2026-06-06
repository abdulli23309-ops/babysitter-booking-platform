import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
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
    window._parentProfileFile = file;
    setMessage('');
  };

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setMessage('Please fill all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('Connecting to server...');

    const fd = new FormData();
    fd.append('FullName', form.fullName);
    fd.append('EmailAddress', form.email);
    fd.append('Username', form.email.split('@')[0]);
    fd.append('Password', form.password);
    fd.append('PhoneNumber', form.phoneNumber);
    fd.append('Address', form.address || 'Not Provided');

    if (window._parentProfileFile) {
      fd.append('ProfilePicture', window._parentProfileFile);
    } else {
      fd.append('UseDefaultPicture', 'true');
    }

    try {
      const res = await fetch('https://localhost:44368/api/parent/register', {
        method: 'POST',
        body: fd,
      });

      // 🛡️ Safe parsing – res may not be JSON if server crashes
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = text || 'Unknown server error';
      }

      if (res.ok) {
        setMessage('Account created successfully!');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        // Extract the error text from any structure
        const errorText =
          typeof data === 'string'
            ? data
            : data?.message || data?.Message || data?.title || JSON.stringify(data);
        setMessage(errorText);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error: Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SUPER SAFE message display – never crashes
  const isSuccess =
    typeof message === 'string' && message.toLowerCase().includes('success');
  const isError = !isSuccess && message;

  return (
    <div style={styles.page}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
      />

      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>←</button>
        <div style={styles.headerTitle}>
          <h1 style={styles.mainTitle}>Create</h1>
          <h2 style={styles.subTitle}>Parent Account</h2>
        </div>
        <div style={styles.imageContainer} onClick={handleImageClick}>
          <div style={styles.imageWrapper}>
            {profileImage ? (
              <img src={profileImage} alt="Preview" style={styles.image} />
            ) : (
              <div style={styles.placeholderIcon}>📷</div>
            )}
          </div>
          <div style={styles.cameraBadge}>📸</div>
        </div>
      </div>

      <div style={styles.formSection}>
        <InputField label="FULL NAME" placeholder="Sadia Malik" value={form.fullName} onChange={(v) => handleChange('fullName', v)} />
        <InputField label="EMAIL ADDRESS" placeholder="example@email.com" type="email" value={form.email} onChange={(v) => handleChange('email', v)} />
        <InputField label="PASSWORD" placeholder="**********" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(v) => handleChange('password', v)} rightIcon={showPassword ? '👁️' : '👁️‍🗨️'} onRightIconClick={() => setShowPassword(!showPassword)} />
        <InputField label="CONFIRM PASSWORD" placeholder="**********" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(v) => handleChange('confirmPassword', v)} />
        <InputField label="PHONE NUMBER" placeholder="+92 300 1234567" value={form.phoneNumber} onChange={(v) => handleChange('phoneNumber', v)} />
        <InputField label="ADDRESS" placeholder="Street, City" value={form.address} onChange={(v) => handleChange('address', v)} />

        {isSuccess && <p style={styles.successMsg}>{message}</p>}
        {isError && <p style={styles.errorMsg}>{message}</p>}

        <button onClick={handleRegister} disabled={loading} style={styles.registerButton}>
          {loading ? 'Registering...' : 'REGISTER NOW'} →
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, type = 'text', value, onChange, rightIcon, onRightIconClick }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>{label}</label>
    <div style={styles.inputWrapper}>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} style={styles.inputField} />
      {rightIcon && <span onClick={onRightIconClick} style={styles.rightIcon}>{rightIcon}</span>}
    </div>
  </div>
);

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #FDE6F0 0%, #E8EAF6 100%)', padding: '20px', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '30px' },
  backButton: { background: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '24px', color: '#FF7A00', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 },
  headerTitle: { textAlign: 'center', flex: 1 },
  mainTitle: { margin: 0, fontSize: '28px', fontWeight: 'bold', lineHeight: 1.2 },
  subTitle: { margin: 0, fontSize: '22px', color: '#666', fontWeight: '400' },
  imageContainer: { position: 'relative', cursor: 'pointer', flexShrink: 0 },
  imageWrapper: { width: '90px', height: '90px', borderRadius: '50%', background: '#FFF5F0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderIcon: { fontSize: '36px', color: '#FF7A00' },
  cameraBadge: { position: 'absolute', bottom: '0', right: '0', background: '#FF7A00', borderRadius: '50%', padding: '5px', fontSize: '14px', color: '#fff', border: '2px solid #fff' },
  formSection: { flex: 1, maxWidth: '400px', margin: '0 auto', width: '100%' },
  inputGroup: { marginBottom: '20px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#FF7A00', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' },
  inputWrapper: { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '14px', padding: '4px 16px', border: '1px solid #eee' },
  inputField: { flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: '15px', outline: 'none' },
  rightIcon: { cursor: 'pointer', fontSize: '20px', paddingLeft: '8px' },
  registerButton: { width: '100%', padding: '18px', borderRadius: '30px', border: 'none', background: 'linear-gradient(90deg, #FF7A00 0%, #FF9D4D 100%)', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px', boxShadow: '0 4px 12px rgba(255,122,0,0.3)' },
  errorMsg: { color: '#e74c3c', textAlign: 'center', fontWeight: '500', margin: '10px 0', fontSize: '14px' },
  successMsg: { color: '#27ae60', textAlign: 'center', fontWeight: '500', margin: '10px 0', fontSize: '14px' },
};

export default CreateAccount;