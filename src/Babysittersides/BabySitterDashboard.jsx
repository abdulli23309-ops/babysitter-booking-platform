import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const Icons = {
  briefcase: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  chatbubble: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  checkmarkCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  person: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  cash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"></rect>
      <circle cx="12" cy="12" r="2"></circle>
      <line x1="6" y1="6" x2="6" y2="6.01"></line>
      <line x1="18" y1="6" x2="18" y2="6.01"></line>
    </svg>
  ),
  menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  bell: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  ),
  chevronForward: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  // New cry detection icon – a simple sound wave
  cryDetection: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  ),
};

const menuItems = [
  {
    key: 'jobRequests',
    icon: <Icons.briefcase />,
    title: 'Job Requests',
    iconBg: 'rgba(255, 100, 140, 0.15)',
    iconColor: '#e8436e',
    route: '/job-request',
    countKey: 'jobRequestCount',
  },
  {
    key: 'chat',
    icon: <Icons.chatbubble />,
    title: 'Chat & Messages',
    iconBg: 'rgba(77, 166, 255, 0.15)',
    iconColor: '#3d8ee8',
    route: '/messages',
    countKey: 'unreadMessagesCount',
  },
  {
    key: 'activeJobs',
    icon: <Icons.checkmarkCircle />,
    title: 'Active Jobs',
    iconBg: 'rgba(76, 217, 100, 0.15)',
    iconColor: '#2db84d',
    route: '/babysitter-my-jobs',
  },
  {
    key: 'availability',
    icon: <Icons.calendar />,
    title: 'Set Availability',
    iconBg: 'rgba(255, 204, 0, 0.15)',
    iconColor: '#e0a800',
    route: '/set-availability',
  },
  {
    key: 'ratings',
    icon: <Icons.star />,
    title: 'Ratings',
    iconBg: 'rgba(155, 89, 182, 0.15)',
    iconColor: '#9b59b6',
    route: '/ratings',
  },
  {
    key: 'profile',
    icon: <Icons.person />,
    title: 'My Profile',
    iconBg: 'rgba(149, 165, 166, 0.15)',
    iconColor: '#7f8c8d',
    route: '/my-profile',
  },
  {
    key: 'earning',
    icon: <Icons.cash />,
    title: 'Earning',
    iconBg: 'rgba(255, 122, 0, 0.15)',
    iconColor: '#e06b00',
    route: '/earnings',
  },
  // ---- New Cry Detection item ----
  {
    key: 'cryDetector',
    icon: <Icons.cryDetection />,
    title: 'Cry Detection',
    iconBg: 'rgba(0, 206, 209, 0.15)',  // soft teal
    iconColor: '#20b2aa',               // lightSeaGreen
    route: '/cry-detector',
    // no count badge
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [jobRequestCount, setJobRequestCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const sitterId = Number(localStorage.getItem('userId'));

  // Apply a gradient background to the whole page
  useEffect(() => {
    const prevBodyBg = document.body.style.background;
    const prevBodyBgA = document.body.style.backgroundAttachment;
    const prevBodyMH = document.body.style.minHeight;
    const prevHtmlMH = document.documentElement.style.minHeight;

    document.body.style.background = 'linear-gradient(135deg, #fce4ec 0%, #f8f9ff 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.minHeight = '100vh';
    document.documentElement.style.minHeight = '100vh';

    return () => {
      document.body.style.background = prevBodyBg;
      document.body.style.backgroundAttachment = prevBodyBgA;
      document.body.style.minHeight = prevBodyMH;
      document.documentElement.style.minHeight = prevHtmlMH;
    };
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const jobRes = await fetch(`api/matching/jobrequests/count?sitterId=${sitterId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setJobRequestCount(jobData.count || 0);
        }
        const msgRes = await fetch(`api/messages/unread/count?sitterId=${sitterId}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setUnreadMessagesCount(msgData.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard counts', error);
      } finally {
        setLoading(false);
      }
    };
    if (sitterId) fetchCounts();
    else setLoading(false);
  }, [sitterId]);

  const counts = { jobRequestCount, unreadMessagesCount };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.iconBtn} onClick={() => navigate('/menu')}>
          <Icons.menu />
        </button>
        <button style={styles.bellBtn} onClick={() => navigate('/babysitter-notifications')}>
          <Icons.bell />
          <span style={styles.bellDot} />
        </button>
      </div>

      {/* Menu Items */}
      <div style={styles.menuContainer}>
        {menuItems.map((item) => {
          const count = item.countKey ? counts[item.countKey] : undefined;
          const showBadge = !loading && count !== undefined && count > 0;

          return (
            <div
              key={item.key}
              style={styles.menuItem}
              onClick={() => item.route && navigate(item.route)}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.015)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={styles.left}>
                <div style={{ ...styles.iconCircle, background: item.iconBg }}>
                  <span style={{ color: item.iconColor, display: 'flex' }}>
                    {item.icon}
                  </span>
                </div>
                <span style={styles.menuText}>{item.title}</span>
              </div>
              <div style={styles.right}>
                {showBadge && (
                  <span style={styles.badge}>{count}</span>
                )}
                <Icons.chevronForward />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <BabysitterBottomNav />
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100%',
    background: 'transparent',
    paddingBottom: '90px',       // room for bottom nav
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 22px 10px',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  bellBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#e8436e',
    border: '1.5px solid white',
  },
  menuContainer: {
    padding: '10px 18px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    padding: '14px 18px',
    borderRadius: '22px',
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconCircle: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuText: {
    fontWeight: 700,
    fontSize: '15.5px',
    color: '#222',
    letterSpacing: '0.01em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    background: '#e05c1a',
    color: '#fff',
    borderRadius: '20px',
    padding: '3px 11px',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: '1.5',
    minWidth: '26px',
    textAlign: 'center',
  },
};

export default Dashboard;