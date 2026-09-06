import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import { useToast } from '../../components/ui/ToastContext';
import styles from './notifications.module.css';

const MOCKUP_NOTIFICATIONS = [
  {
    id: 'notif-shift-started',
    type: 'shift_started',
    title: 'Shift Started',
    time: '5m ago',
    message: 'You have checked in and begun your scheduled session for Hamza Ahmed.',
    actionLabel: 'View Job',
    targetRoute: '/active-job-details',
  },
  {
    id: 'notif-job-match',
    type: 'job_match',
    title: 'New Job Match',
    time: '1h ago',
    message: 'A new care opportunity in DHA Phase 6 matches your working hours & rate.',
    actionLabel: 'View Details',
    targetRoute: '/babysitter-my-jobs',
  },
  {
    id: 'notif-job-request',
    type: 'job_request',
    title: 'New Job Request',
    time: '3h ago',
    message: 'Sadia Malik sent you a booking request for Friday, Oct 30 (04:00 PM - 09:00 PM).',
    splitActions: true,
  },
];

export default function BabysitterNotifications() {
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState(MOCKUP_NOTIFICATIONS);

  const handleAccept = (id) => {
    toast.success('Job request accepted successfully!');
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    navigate('/job-accepted-success');
  };

  const handleDecline = (id) => {
    toast.info('Job request declined.');
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className={styles.notifContainer}>
      {/* Top Bar: Frame 15 BackButton, centered title, circular options button */}
      <header className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Notifications</h1>
        <div style={{ width: 42 }} />
      </header>

      {/* Notifications List (Frame 15) */}
      <section className={styles.notifList} aria-label="Notifications List">
        {notifications.map((item) => (
          <div key={item.id} className={styles.card}>
            {/* Top Row: Icon, Title & Time */}
            <div className={styles.cardTopRow}>
              <div className={styles.cardHeaderLeft}>
                {item.type === 'shift_started' && (
                  <div className={styles.iconWrapper} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  </div>
                )}
                {item.type === 'job_match' && (
                  <div className={styles.iconWrapperPeach} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                )}
                {item.type === 'job_request' && (
                  <div className={styles.iconWrapperPeach} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                )}
                <h2 className={styles.cardTitle}>{item.title}</h2>
              </div>
              <span className={styles.cardTime}>{item.time}</span>
            </div>

            {/* Middle Row: Message */}
            <p className={styles.cardMessage}>{item.message}</p>

            {/* Bottom Row: Actions matching Frame 15 */}
            {item.type === 'shift_started' && (
              <div className={styles.cardActionsEnd}>
                <button
                  type="button"
                  className={styles.btnOutlineOrange}
                  onClick={() => navigate(item.targetRoute)}
                >
                  {item.actionLabel}
                </button>
              </div>
            )}

            {item.type === 'job_match' && (
              <div className={styles.cardActionsEnd}>
                <button
                  type="button"
                  className={styles.btnSolidOrange}
                  onClick={() => navigate(item.targetRoute)}
                >
                  {item.actionLabel}
                </button>
              </div>
            )}

            {item.type === 'job_request' && (
              <div className={styles.cardActionsSplit}>
                <button
                  type="button"
                  className={styles.btnDecline}
                  onClick={() => handleDecline(item.id)}
                >
                  Decline
                </button>
                <button
                  type="button"
                  className={styles.btnAccept}
                  onClick={() => handleAccept(item.id)}
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      <BabysitterBottomNav />
    </div>
  );
}
