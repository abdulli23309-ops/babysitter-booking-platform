import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://localhost:44368';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('parent'); // 'parent' or 'babysitter'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Set role from previous screen or localStorage ─────────────────────────
  useEffect(() => {
    const selectedRole = location.state?.selectedRole;
    if (selectedRole === 'parent' || selectedRole === 'babysitter') {
      setRole(selectedRole);
      localStorage.setItem('role', selectedRole);
    } else {
      const savedRole = localStorage.getItem('role');
      if (savedRole === 'parent' || savedRole === 'babysitter') {
        setRole(savedRole);
      }
    }
  }, [location.state]);

  // ── Handle login ─────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage('Please enter username and password');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const endpoint =
        role === 'parent'
          ? `${API_BASE_URL}/api/parent/login`
          : `${API_BASE_URL}/api/babysitter/login`;

      const payload = {
  Username: username.trim(),
  Password: password.trim(),
  Role: role === 'parent' ? 'Parent' : 'Sitter',
};
      console.log('--- LOGIN ATTEMPT ---');
      console.log('Endpoint:', endpoint);
      console.log('Payload:', payload);

      const res = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = res.data;
      console.log('Server Data Received:', data);

      // Extract user ID from various possible response fields
      const userId = data.userId || data.id || data.UserId || data.sitterId;
      if (!data || !userId) {
        throw new Error('Invalid response from server');
      }

      // Save session data
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      setMessage('Login Successful ✅');

      // Navigate to the appropriate dashboard after a short delay
      setTimeout(() => {
        setLoading(false);
        const targetPath = role === 'parent' ? '/main-screen' : '/babysitter-dashboard';
        console.log('Navigating to:', targetPath);
        navigate(targetPath, { replace: true });
      }, 800);
    } catch (err) {
      setLoading(false);
      console.error('Login Error:', err);
      const errorMsg =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message || err.message || 'Login Failed ❌';
      setMessage(String(errorMsg));
    }
  };

  // ── Navigate to correct registration screen ───────────────────────────────
  const handleCreateAccount = () => {
    const target = role === 'parent' ? '/create-account' : '/register';
    navigate(target);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Loading Overlay */}
      {loading && (
        <div style={styles.overlay}>
          <div style={styles.loadingBox}>Authenticating...</div>
        </div>
      )}

      <div style={styles.container}>
        <h1 style={styles.appTitle}>Little Care</h1>
        <p style={styles.subtitle}>Nurturing with love and safety</p>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Login</h2>

          {/* Username */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {/* Message */}
          {message && (
            <p style={message.includes('✅') ? styles.successMsg : styles.errorMsg}>
              {message}
            </p>
          )}

          {/* Role Selection (Radio Buttons) */}
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value="parent"
                checked={role === 'parent'}
                onChange={() => setRole('parent')}
                disabled={loading}
              />
              Parent
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value="babysitter"
                checked={role === 'babysitter'}
                onChange={() => setRole('babysitter')}
                disabled={loading}
              />
              Babysitter
            </label>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
          >
            {loading ? 'Processing...' : 'Login'}
          </button>

          {/* Create Account Link */}
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <span style={styles.link} onClick={handleCreateAccount}>
              Create New Account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  appTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '1rem',
    opacity: 0.8,
    marginBottom: '30px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.8rem',
    color: '#333',
  },
  inputGroup: {
    marginBottom: '18px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border 0.2s',
  },
  radioGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    margin: '20px 0',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#C8521A',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  footerText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#C8521A',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  errorMsg: {
    color: '#e74c3c',
    textAlign: 'center',
    margin: '10px 0',
    fontSize: '14px',
  },
  successMsg: {
    color: '#27ae60',
    textAlign: 'center',
    margin: '10px 0',
    fontSize: '14px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    background: '#fff',
    padding: '20px 40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    fontSize: '16px',
    fontWeight: '500',
  },
};

export default Login;