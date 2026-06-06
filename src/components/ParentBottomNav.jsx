import { useNavigate, useLocation } from 'react-router-dom';

const orange = '#E8622A';

const Icons = {
  homeOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  dashboardOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  profileOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>
  ),
  searchOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  moreOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
};

const tabs = [
  { icon: 'homeOutline', label: 'Home', route: '/parent-home' },
  { icon: 'dashboardOutline', label: 'Dashboard', route: '/parent-dashboard' },
  { icon: 'profileOutline', label: 'Profile', route: '/parent-profile' },
  { icon: 'searchOutline', label: 'FIND SITTER', route: '/search-babysitter' },
  { icon: 'moreOutline', label: 'More', route: '/more' },
];

const ParentBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
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
      }}
    >
      {tabs.map((item) => {
        const isActive =
          location.pathname === item.route || location.pathname.startsWith(item.route + '/');
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
            <div style={{ fontSize: '11px', fontWeight: 700 }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ParentBottomNav;