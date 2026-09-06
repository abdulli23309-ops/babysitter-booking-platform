import { useNavigate, useLocation } from 'react-router-dom';
import styles from './bottom-nav.module.css';

const Icons = {
  dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  jobs: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  alerts: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  profile: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>
  ),
};

const tabs = [
  { icon: 'dashboard', label: 'Dashboard', route: '/parent-dashboard', matches: ['/parent-dashboard', '/main-screen', '/parent-home'] },
  { icon: 'search', label: 'Find Sitter', route: '/search-babysitter', matches: ['/search-babysitter', '/babysitter-details', '/babysitter-details-2'] },
  { icon: 'jobs', label: 'My Jobs', route: '/my-jobs', matches: ['/my-jobs', '/parent-active-job', '/parent-upcoming-job', '/parent-my-jobs'] },
  { icon: 'alerts', label: 'Alerts', route: '/parent-notifications', matches: ['/parent-notifications', '/cry-alert', '/baby-monitoring'] },
  { icon: 'profile', label: 'Profile', route: '/parent-profile', matches: ['/parent-profile', '/child-profile', '/set-child-profile', '/update-child-profile'] },
];

export default function ParentBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav aria-label="Parent navigation" className={styles.bottomNav}>
      {tabs.map((item) => {
        const isActive = item.matches.some(
          (path) => location.pathname === path || location.pathname.startsWith(path + '/')
        );
        const IconComp = Icons[item.icon];

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.route)}
            className={`${styles.navButton} ${isActive ? styles.navButtonActive : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.navIconWrapper}>
              <IconComp />
            </span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

