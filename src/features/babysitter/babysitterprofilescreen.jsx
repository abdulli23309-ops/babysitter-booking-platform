import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import BackButton from '../../components/ui/BackButton';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import { apiGet } from '../../services/apiClient';
import styles from './babysitter-jobs.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/150?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

export default function MyProfile() {
  const navigate = useNavigate();
  const { user, userId, logout, deactivateAccount } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(userId));
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchProfile() {
      if (!userId) return;
      try {
        const data = await apiGet(`/matching/babysitter/${userId}`);
        if (!ignore) {
          setProfile(data);
        }
      } catch {
        // fallback to auth context user
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const name = profile?.FullName ?? user?.name ?? user?.FullName ?? 'Caregiver';
  const email = profile?.EmailAddress ?? user?.email ?? 'sitter@example.com';
  const phone = profile?.PhoneNumber ?? user?.phone ?? '+92 300 1234567';
  const city = profile?.City ?? user?.city ?? 'Islamabad';
  const pic = buildImageUrl(profile?.PictureAddress ?? user?.profilePicture);
  const hourlyRate = profile?.HourlyRate ?? 500;
  const expYears = profile?.ExperienceYears ?? 1;

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivateAccount('babysitter');
    } catch (err) {
      toast.error(err?.message || 'Network error during deactivation. Please try again.');
      setIsDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.jobsContainer} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner size="lg" label="Loading caregiver profile..." />
        <BabysitterBottomNav />
      </div>
    );
  }

  return (
    <div className={styles.jobsContainer}>
      {/* Top Bar */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton />
          <h1 className={styles.title}>Caregiver Profile</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/update-profile')}
          style={{
            background: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 14px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Edit Profile
        </button>
      </div>

      {/* Hero Profile Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-3)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {!avatarFailed && pic ? (
          <img
            src={pic}
            alt={name}
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--color-primary)',
              boxShadow: 'var(--shadow-md)',
            }}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: '#FFF5EE',
              color: '#E8622A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 800,
              border: '3px solid #E8622A',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {(name.trim().charAt(0) || 'C').toUpperCase()}
          </div>
        )}
        <div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {name}
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            📍 {city} • ⭐️ 5.0 Top Caregiver
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', width: '100%', marginTop: 'var(--space-2)' }}>
          <div style={{ flex: 1, background: 'var(--color-surface-alt)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Hourly Rate</span>
            <strong style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>PKR {hourlyRate}/hr</strong>
          </div>
          <div style={{ flex: 1, background: 'var(--color-surface-alt)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Experience</span>
            <strong style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}>{expYears} {expYears === 1 ? 'Year' : 'Years'}</strong>
          </div>
        </div>
      </div>

      {/* Account Info List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ background: 'var(--color-surface)', padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Email Address</span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{email}</span>
        </div>
        <div style={{ background: 'var(--color-surface)', padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Phone Number</span>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{phone}</span>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Button variant="secondary" fullWidth onClick={() => navigate('/ratings')}>
          View Parent Reviews & Ratings →
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/earnings')}>
          View Earnings & Payouts →
        </Button>
      </div>

      {/* Security Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <Button variant="outlined" fullWidth onClick={logout}>
          Sign Out
        </Button>
        <Button variant="danger" fullWidth onClick={() => setShowDeactivateModal(true)}>
          Deactivate Account
        </Button>
      </div>

      {/* Deactivation Confirmation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Caregiver Account?"
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Deactivating your account will remove your profile from active parent searches and cancel any upcoming bookings.
          Are you sure you want to proceed?
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <Button variant="secondary" onClick={() => setShowDeactivateModal(false)} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeactivate}
            loading={isDeactivating}
            style={{ flex: 1 }}
          >
            Deactivate
          </Button>
        </div>
      </Modal>

      <BabysitterBottomNav />
    </div>
  );
}

