import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import { useAuth } from '../auth/AuthContext';
import styles from './parent-dashboard.module.css';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, userId } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const parentName = user?.name ?? user?.FullName ?? user?.Username ?? 'Parent';
  const parentAvatar = user?.profilePicture ?? user?.ProfilePicture ?? null;
  const sitterAvatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80';
  void sitterAvatar;

  useEffect(() => {
    let ignore = false;
    async function fetchUnread() {
      if (!userId) return;
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/notifications?userId=${userId}&userRole=Parent`, { headers });
        if (res.status === 401 || res.status === 404) {
          if (!ignore) setUnreadCount(0);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (!ignore && Array.isArray(data)) {
            const unread = data.filter((n) => !n.IsRead && !n.isRead).length;
            setUnreadCount(unread);
          }
        }
      } catch {
        // silent catch
      }
    }

    fetchUnread();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Greeting Header */}
      <header className={styles.header}>
        <div className={styles.greetingSection}>
          <span className={styles.greetingSub}>{getGreeting()}</span>
          <h1 className={styles.greetingName}>{parentName} 👋</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => navigate('/parent-notifications')}
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className={styles.pulseDot} />}
          </button>
          <button
            type="button"
            className={styles.avatarBtn}
            onClick={() => navigate('/parent-profile')}
            aria-label="Parent Profile"
          >
            {parentAvatar ? (
              <img src={parentAvatar} alt={parentName} className={styles.avatarImg} />
            ) : (
              (parentName.charAt(0) || 'P').toUpperCase()
            )}
          </button>
        </div>
      </header>

      {/* Hero Feature Card */}
      <section className={styles.heroCard}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          <span>Smart AI Monitoring Ready</span>
        </div>
        <h2 className={styles.heroTitle}>Peace of mind for your child</h2>
        <p className={styles.heroText}>
          Find certified local babysitters or initiate real-time AI cry monitoring instantly.
        </p>
        <button
          type="button"
          className={styles.heroCta}
          onClick={() => navigate('/search-babysitter')}
        >
          <span>Find Babysitter</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </section>

      {/* 2x2 Bento Operations Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
            Quick Operations
          </h3>
        </div>

        <div className={styles.bentoGrid}>
          {/* Bento 1: Find Caregivers */}
          <div
            className={styles.bentoCard}
            onClick={() => navigate('/search-babysitter')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/search-babysitter')}
          >
            <div className={styles.bentoTop}>
              <div className={styles.bentoIconWrapper} style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <span className={styles.badgePill} style={{ background: 'var(--badge-warning-bg)', color: 'var(--color-primary)' }}>
                Top Rated
              </span>
            </div>
            <div className={styles.bentoBottom}>
              <h4 className={styles.bentoCardTitle}>Find Sitter</h4>
              <p className={styles.bentoCardSubtitle}>Search certified sitters</p>
            </div>
          </div>

          {/* Bento 2: My Bookings */}
          <div
            className={styles.bentoCard}
            onClick={() => navigate('/my-jobs')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/my-jobs')}
          >
            <div className={styles.bentoTop}>
              <div className={styles.bentoIconWrapper} style={{ background: 'var(--badge-info-bg)', color: 'var(--badge-info-text)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className={styles.badgePill} style={{ background: 'var(--badge-info-bg)', color: 'var(--badge-info-text)' }}>
                Active
              </span>
            </div>
            <div className={styles.bentoBottom}>
              <h4 className={styles.bentoCardTitle}>My Bookings</h4>
              <p className={styles.bentoCardSubtitle}>Active & past schedule</p>
            </div>
          </div>

          {/* Bento 3: Live Baby Monitor */}
          <div
            className={styles.bentoCard}
            onClick={() => navigate('/baby-monitoring')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/baby-monitoring')}
          >
            <div className={styles.bentoTop}>
              <div className={styles.bentoIconWrapper} style={{ background: 'var(--badge-purple-bg)', color: 'var(--badge-purple-text)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <span className={styles.badgePill} style={{ background: 'var(--badge-purple-bg)', color: 'var(--badge-purple-text)' }}>
                WebRTC
              </span>
            </div>
            <div className={styles.bentoBottom}>
              <h4 className={styles.bentoCardTitle}>Baby Monitor</h4>
              <p className={styles.bentoCardSubtitle}>Live camera feed</p>
            </div>
          </div>

          {/* Bento 4: Child Profile */}
          <div
            className={styles.bentoCard}
            onClick={() => navigate('/child-profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/child-profile')}
          >
            <div className={styles.bentoTop}>
              <div className={styles.bentoIconWrapper} style={{ background: 'var(--badge-success-bg)', color: 'var(--badge-success-text)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className={styles.badgePill} style={{ background: 'var(--badge-success-bg)', color: 'var(--badge-success-text)' }}>
                Profile
              </span>
            </div>
            <div className={styles.bentoBottom}>
              <h4 className={styles.bentoCardTitle}>Children</h4>
              <p className={styles.bentoCardSubtitle}>Emergency care notes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Nursery Tools */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
            Nursery Essentials
          </h3>
        </div>

        <div className={styles.quickList}>
          <div
            className={styles.quickItem}
            onClick={() => navigate('/child-cry-alert')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/child-cry-alert')}
          >
            <div className={styles.quickItemLeft}>
              <div className={styles.quickIcon} style={{ background: 'var(--badge-warning-bg)', color: 'var(--color-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <h4 className={styles.quickTitle}>Cry Detection Alerts</h4>
                <p className={styles.quickDesc}>Real-time infant acoustic alert settings</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          <div
            className={styles.quickItem}
            onClick={() => navigate('/set-child-profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/set-child-profile')}
          >
            <div className={styles.quickItemLeft}>
              <div className={styles.quickIcon} style={{ background: 'var(--badge-info-bg)', color: 'var(--badge-info-text)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h4 className={styles.quickTitle}>Register New Child</h4>
                <p className={styles.quickDesc}>Add medical details and caregiver requirements</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </section>

      <ParentBottomNav />
    </div>
  );
}
