import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';
const orangeLight = '#fff3ee';

const Icons = {
  addCircleOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  listOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  happyOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
    </svg>
  ),
  videocamOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  bodyOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2.5" />
      <path d="M7 10h10l-1 5H8l-1-5z" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
      <line x1="7" y1="10" x2="5" y2="14" />
      <line x1="17" y1="10" x2="19" y2="14" />
    </svg>
  ),
  notificationsOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  cardOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  chevronForward: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  bell: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

const menuItems = [
  { icon: 'addCircleOutline', title: 'Find Sitter', subtitle: 'Find a new babysitter', route: '/search-babysitter', badge: false },
  { icon: 'listOutline', title: 'My Jobs', subtitle: 'Manage active listings', route: '/my-jobs', badge: false },
  { icon: 'happyOutline', title: 'View Child Profile', subtitle: 'Medical info & habits', route: '/child-profile', badge: false },
  { icon: 'videocamOutline', title: 'Live Baby Monitoring', subtitle: 'Real-time camera feed', route: '/monitor', badge: true },
  { icon: 'bodyOutline', title: 'Set Child Profile', subtitle: 'Add or edit child details', route: '/set-child-profile', badge: false },
  { icon: 'notificationsOutline', title: 'Cry Alert Screen', subtitle: 'Sound detection settings', route: '/child-cry-alert', badge: false },
  { icon: 'cardOutline', title: 'Babysitter Profile', subtitle: 'View hired professionals', route: '/baby-sitters-list', badge: false },
];

const ParentDashboard = () => {
  const navigate = useNavigate();

  // --- Load logged‑in user data ---
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setUserData(JSON.parse(userStr));
    } catch (e) {
      console.error('Failed to parse user data', e);
    }

    // Preserve body gradient on scroll
    const prevBg = document.body.style.background;
    const prevBgA = document.body.style.backgroundAttachment;
    const prevMH = document.body.style.minHeight;
    const prevHMH = document.documentElement.style.minHeight;
    document.body.style.background = 'linear-gradient(160deg, #f9cfe0 0%, #e8d6f0 40%, #ccd8f5 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100%';
    document.documentElement.style.minHeight = '100%';

    return () => {
      document.body.style.background = prevBg;
      document.body.style.backgroundAttachment = prevBgA;
      document.body.style.minHeight = prevMH;
      document.documentElement.style.minHeight = prevHMH;
    };
  }, []);

  const parentName = userData?.name || userData?.FullName || 'Parent';

  const IconEl = ({ name, size = 24, color = 'currentColor' }) => {
    const IconComp = Icons[name];
    return IconComp ? <span style={{ display: 'flex', color }}><IconComp width={size} height={size} /></span> : null;
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBox}>
            <IconEl name="happyOutline" size={20} color="#fff" />
          </div>
          <span style={styles.appName}>Little Care</span>
        </div>
        <div onClick={() => navigate('/parent-notifications')} style={styles.bellBtn}>
          <Icons.bell />
        </div>
      </div>

      {/* Title */}
      <div style={styles.titleSection}>
        <h1 style={styles.title}>Parent Dashboard</h1>
        <p style={styles.welcomeText}>Welcome back, {parentName}</p>
      </div>

      {/* Menu Cards */}
      <div style={styles.menuContainer}>
        {menuItems.map((item) => (
          <div key={item.title} style={styles.card} onClick={() => navigate(item.route)}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.013)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <div style={styles.iconWrapper}>
              <div style={styles.iconCircle}>
                <IconEl name={item.icon} size={24} color={orange} />
              </div>
              {item.badge && <span style={styles.badgeDot} />}
            </div>
            <div style={styles.cardText}>
              <p style={styles.cardTitle}>{item.title}</p>
              <p style={styles.cardSubtitle}>{item.subtitle}</p>
            </div>
            <Icons.chevronForward />
          </div>
        ))}
      </div>

      <ParentBottomNav />
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'transparent',
    paddingBottom: '90px',
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 22px 10px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: orange,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(232,98,42,0.35)',
  },
  appName: {
    fontWeight: '800',
    fontSize: '17px',
    color: '#222',
  },
  bellBtn: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  titleSection: {
    padding: '10px 22px 22px',
  },
  title: {
    margin: '0 0 4px',
    fontWeight: '900',
    fontSize: '30px',
    color: '#1a1a1a',
    letterSpacing: '-0.5px',
  },
  welcomeText: {
    margin: 0,
    fontSize: '14px',
    color: '#aaa',
    fontWeight: '500',
  },
  menuContainer: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '15px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 3px 14px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
  },
  iconWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  iconCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '16px',
    background: orangeLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#e74c3c',
    border: '2px solid #fff',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    margin: '0 0 2px',
    fontWeight: '700',
    fontSize: '15px',
    color: '#1a1a1a',
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#bbb',
    fontWeight: '500',
  },
};

export default ParentDashboard;