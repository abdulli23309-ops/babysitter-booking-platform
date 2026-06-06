// JobPostedSuccess.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const orange = '#E8622A';

/* ── Nav Icons ── */
const Icons = {
  dashboard: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  jobs: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM8 19H4V9h4v10zm6 0h-4V9h4v10zm6 0h-4V9h4v10zM16 5V3H8v2H2v2h20V5h-6z" />
    </svg>
  ),
  postJob: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  profile: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  more: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  ),
};

const navItems = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/parent-dashboard' },
  { key: 'jobs',      icon: 'jobs',      label: 'Jobs',       path: '/parent-my-jobs'   },
  { key: 'postJob',   icon: 'postJob',   label: 'Post Job',   path: '/post-job'          },
  { key: 'profile',   icon: 'profile',   label: 'Profile',    path: '/parent-profile'    },
  { key: 'more',      icon: 'more',      label: 'More',       path: '/more'              },
];

const JobPostedSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f0eef8 0%, #e8e4f4 50%, #dce4f8 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Nunito', sans-serif",
        paddingBottom: '80px',
      }}
    >
      

      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 20px',
          position: 'relative',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: '20px',
            width: '36px',
            height: '36px',
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e' }}>Success</span>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 28px',
          textAlign: 'center',
        }}
      >
        {/* Green Check */}
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-16px',
              background: 'radial-gradient(circle, rgba(72,199,116,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              width: '90px',
              height: '90px',
              background: '#48c774',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(72,199,116,0.4)',
              position: 'relative',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1a1a2e', marginBottom: '12px', lineHeight: 1.2 }}>
          Job Posted Successfully!
        </h1>

        <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6, marginBottom: '24px', maxWidth: '280px' }}>
          Your babysitting request has been successfully posted. Nearby babysitters will be notified shortly.
        </p>

        {/* Info Box */}
        <div
          style={{
            background: '#f0faf4',
            border: '1px solid #c3e6cb',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            textAlign: 'left',
            marginBottom: '32px',
            width: '100%',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#48c774" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" fill="#48c774" />
          </svg>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.5, fontWeight: 600, margin: 0 }}>
            You will receive notifications when a babysitter accepts your request.
          </p>
        </div>

        {/* Buttons */}
        <button
          onClick={() => navigate('/parent-dashboard')}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: orange,
            color: '#fff',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginBottom: '12px',
            boxShadow: '0 6px 20px rgba(232,98,42,0.35)',
          }}
        >
          Back to Dashboard
        </button>

        <button
          onClick={() => navigate('/parent-my-jobs')}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '16px',
            border: `2px solid ${orange}`,
            background: 'transparent',
            color: orange,
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          View My Jobs
        </button>
      </div>

      {/* Bottom Navigation */}
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
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComp = Icons[item.icon];
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                color: isActive ? orange : '#bbb',
              }}
            >
              <IconComp />
              <span style={{ fontSize: '10px', fontWeight: 700 }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobPostedSuccess;