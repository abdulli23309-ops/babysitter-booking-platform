import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import styles from './notifications.module.css';

const DEFAULT_PARENT_NOTIFICATIONS = [
  {
    id: 'parent-notif-1',
    title: 'Caregiver Check-In',
    time: '5m ago',
    message: 'Sadia Malik arrived and started the active booking session.',
    iconType: 'play',
    actionType: 'view_job',
    actionLabel: 'View Active Session',
    targetRoute: '/parent-active-job',
  },
  {
    id: 'parent-notif-2',
    title: 'Booking Confirmed',
    time: '2h ago',
    message: 'Your upcoming booking request for tomorrow has been confirmed.',
    iconType: 'briefcase',
    actionType: 'view_details',
    actionLabel: 'View Booking',
    targetRoute: '/parent-upcoming-job',
  },
  {
    id: 'parent-notif-3',
    title: 'Cry Alert Reminder',
    time: '4h ago',
    message: 'AI Cry Minder is active. You will receive real-time acoustic alerts.',
    iconType: 'bell',
    actionType: 'view_details',
    actionLabel: 'Monitor Nursery',
    targetRoute: '/baby-monitoring',
  },
];

export default function ParentNotifications() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('parent_notifications_cache');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PARENT_NOTIFICATIONS;
  });

  const [latestCryRoom, setLatestCryRoom] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!userId) return;
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/notifications?userId=${userId}&userRole=Parent`, { headers });
        if (res.status === 401 || res.status === 404) {
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (!ignore && Array.isArray(data) && data.length > 0) {
            const mapped = data.map((n, idx) => {
              const id = n.Notification_ID ?? n.NotificationId ?? n.id ?? `pnotif-${idx}`;
              const title = n.Title ?? n.title ?? 'Platform Alert';
              const body = n.Message ?? n.message ?? n.text ?? '';
              const time = n.CreatedAt
                ? new Date(n.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent';

              return {
                id,
                title,
                time,
                message: body,
                iconType: 'bell',
                actionType: 'view_details',
                actionLabel: 'View Details',
                targetRoute: '/my-jobs',
              };
            });
            setNotifications(mapped);
          }
        }
      } catch {
        // silent fallback
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  // Poll for latest cry alert
  useEffect(() => {
    let mounted = true;
    const checkCryAlert = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/cry-detection/latest', { headers });
        if (res.status === 401 || res.status === 404) {
          return;
        }
        if (res.ok && mounted) {
          const data = await res.json();
          if (data && (data.roomName || data.RoomName)) {
            setLatestCryRoom(data.roomName ?? data.RoomName);
          }
        }
      } catch {
        // silent polling catch
      }
    };

    checkCryAlert();
    const interval = setInterval(checkCryAlert, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleClearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.setItem('parent_notifications_cache', JSON.stringify([]));
    } catch {
      // ignore
    }
    toast.info('Notifications cleared');
  };

  const handleRestoreDemo = () => {
    setNotifications(DEFAULT_PARENT_NOTIFICATIONS);
    try {
      localStorage.removeItem('parent_notifications_cache');
    } catch {
      // ignore
    }
    toast.success('Sample alerts restored');
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'play':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polygon points="10 8 16 12 10 16" fill="#E8622A" stroke="#E8622A" />
          </svg>
        );
      case 'briefcase':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      case 'bell':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
    }
  };

  return (
    <div className={styles.notifContainer}>
      {/* TASK A: Header Construction */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Notifications</h1>
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClearNotifications}
          aria-label="Clear Notifications"
        >
          Clear Notifications
        </button>
      </div>

      {/* Urgent Cry Alert Banner */}
      {latestCryRoom && (
        <section className={styles.cryAlertCard}>
          <div className={styles.cryAlertHeader}>
            <span className={styles.alertPulseDot} />
            <span>CRITICAL NURSERY CRY ALERT</span>
          </div>
          <p className={styles.cryAlertText}>
            Acoustic infant distress sound detected by AI Cry Minder. Tap below to launch live secure video monitoring feed immediately.
          </p>
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={() => navigate('/baby-monitoring', { state: { roomName: latestCryRoom } })}
          >
            Launch Live Camera Feed
          </Button>
        </section>
      )}

      {/* TASK B: Notifications List */}
      <section className={styles.notifList} aria-label="Notifications list">
        {notifications.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>No Notifications</h2>
            <p className={styles.emptyDesc}>You have no unread notifications or sound alerts at this time.</p>
            <button type="button" className={styles.restoreBtn} onClick={handleRestoreDemo}>
              Restore Alerts
            </button>
          </div>
        ) : (
          notifications.map((item) => {
            const isPeachWrapper = item.iconType === 'briefcase' || item.iconType === 'bell';
            const iconWrapClass = isPeachWrapper ? styles.iconWrapperPeach : styles.iconWrapper;

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardTopRow}>
                  <div className={styles.cardHeaderLeft}>
                    <div className={iconWrapClass}>
                      {renderIcon(item.iconType)}
                    </div>
                    <h2 className={styles.cardTitle}>{item.title}</h2>
                  </div>
                  <span className={styles.cardTime}>{item.time}</span>
                </div>

                <p className={styles.cardMessage}>{item.message}</p>

                <div className={styles.cardActionsEnd}>
                  <button
                    type="button"
                    className={styles.btnOutlineOrange}
                    onClick={() => navigate(item.targetRoute || '/my-jobs')}
                  >
                    {item.actionLabel || 'View Details'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      <ParentBottomNav />
    </div>
  );
}
