import { useNavigate, useLocation } from 'react-router-dom';

const orange = '#E8622A';

const Icons = {
  briefcaseOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  chatbubbleOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  walletOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="9" x2="16" y2="9" />
      <path d="M16 15h.01" />
    </svg>
  ),
  personCircleOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>
  ),
};

const tabs = [
  { icon: 'briefcaseOutline', label: 'Jobs', route: '/job-request' },
  { icon: 'chatbubbleOutline', label: 'Messages', route: '/messages' },
  { icon: 'walletOutline', label: 'Earnings', route: '/earnings' },
  { icon: 'personCircleOutline', label: 'Profile', route: '/my-profile' },
];

const BabysitterBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0 20px',
      boxShadow: '0 -2px 20px rgba(0,0,0,0.06)',
      zIndex: 100,
    }}>
      {tabs.map((item) => {
        const isActive = location.pathname === item.route || location.pathname.startsWith(item.route + '/');
        const IconComp = Icons[item.icon];
        return (
          <div
            key={item.label}
            onClick={() => navigate(item.route)}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              color: isActive ? orange : '#bbb',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <IconComp />
            <div style={{ fontSize: '11px', fontWeight: 700 }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default BabysitterBottomNav;