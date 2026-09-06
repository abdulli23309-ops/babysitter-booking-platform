import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Button from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/ToastContext';
import styles from './login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [role, setRole] = useState(() => {
    const selectedRole = location.state?.selectedRole;
    if (selectedRole === 'parent' || selectedRole === 'babysitter') {
      localStorage.setItem('role', selectedRole);
      return selectedRole;
    }
    const savedRole = localStorage.getItem('role');
    if (savedRole === 'parent' || savedRole === 'babysitter') {
      return savedRole;
    }
    return 'parent';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    localStorage.setItem('role', newRole);
    setError('');
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint =
        role === 'parent'
          ? '/api/parent/login'
          : '/api/babysitter/login';

      const payload = {
        Username: username.trim(),
        Password: password.trim(),
        Role: role === 'parent' ? 'Parent' : 'Sitter',
      };

      const res = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = res.data;
      const userId = data.userId || data.id || data.UserId || data.sitterId;
      if (!data || !userId) {
        throw new Error('Invalid response from server');
      }

      const rawResponseRole = data.role ?? data.Role;
      const normalizedRole =
        rawResponseRole != null
          ? (String(rawResponseRole).toLowerCase() === 'sitter' ? 'babysitter' : String(rawResponseRole).toLowerCase())
          : role;

      login({
        userId,
        role: normalizedRole,
        token: data.token ?? data.Token,
        expiresAt: data.expiresAt ?? data.ExpiresAt,
        user: data,
      });

      showToast('Welcome back! You are now logged in.', { type: 'success' });

      setLoading(false);
      const targetPath = role === 'parent' ? '/main-screen' : '/babysitter-dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setLoading(false);
      let errorMsg;

      if (err.response?.status === 401) {
        errorMsg =
          typeof err.response?.data === 'string' && err.response.data
            ? err.response.data
            : err.response?.data?.message || 'Invalid username or password. Please verify your role and credentials.';
      } else if (err.response?.data) {
        errorMsg =
          typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data.message || err.message || 'Login failed. Please try again.';
        console.error('Login Error:', err);
      } else {
        errorMsg = err.message || 'Unable to connect to server. Please check your network or backend server.';
        console.error('Login Error:', err);
      }

      const normalized = String(errorMsg);
      setError(normalized);
      showToast(normalized, { type: 'error' });
    }
  };

  const handleCreateAccount = () => {
    const target = role === 'parent' ? '/create-account' : '/register';
    navigate(target);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
          <BackButton onClick={() => navigate('/role')} />
        </div>
        <h1 className={styles.appTitle}>Little Care</h1>
        <p className={styles.subtitle}>Nurturing with love and safety</p>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Login</h2>

          {/* Role Selection */}
          <div className={styles.roleGroup} role="radiogroup" aria-label="Select your role">
            <button
              type="button"
              role="radio"
              aria-checked={role === 'parent'}
              className={[styles.rolePill, role === 'parent' ? styles.rolePillActive : ''].filter(Boolean).join(' ')}
              onClick={() => handleRoleSelect('parent')}
              disabled={loading}
            >
              Parent
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={role === 'babysitter'}
              className={[styles.rolePill, role === 'babysitter' ? styles.rolePillActive : ''].filter(Boolean).join(' ')}
              onClick={() => handleRoleSelect('babysitter')}
              disabled={loading}
            >
              Babysitter
            </button>
          </div>

          {/* Username */}
          <Input
            label="Username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter your username"
            disabled={loading}
          />

          {/* Password */}
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter your password"
            disabled={loading}
            error={error || undefined}
          />

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            loading={loading}
            block
            size="lg"
            style={{ marginTop: 'var(--space-4)' }}
          >
            {loading ? 'Signing in…' : 'Login'}
          </Button>

          {/* Create Account Link */}
          <p className={styles.footerText}>
            Don&apos;t have an account?{' '}
            <button type="button" className={styles.link} onClick={handleCreateAccount}>
              Create New Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

