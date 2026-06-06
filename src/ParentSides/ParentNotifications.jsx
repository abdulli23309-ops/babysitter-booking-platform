import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';
const API_BASE = 'https://localhost:44368/api';

// ---------- SVG Icons ----------
const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  notifications: () => (
    <svg width="40" height="40" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M427.68 351.43C402 320 383.87 288 383.87 256c0-61.86-38.45-114.15-88.47-140.33A80.45 80.45 0 0 0 256 48a80.45 80.45 0 0 0-39.4 67.67c-50 26.18-88.47 78.47-88.47 140.33 0 32-18.13 64-43.81 95.43A16 16 0 0 0 96 368h320a16 16 0 0 0 11.68-16.57Z" />
      <path d="M192 400a64 64 0 0 0 128 0" />
    </svg>
  ),
  videocam: () => (
    <svg width="20" height="20" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M374.79 308.78 457.5 367a16 16 0 0 0 22.5-14.62V159.62A16 16 0 0 0 457.5 145l-82.71 58.22A16 16 0 0 0 368 216.3v79.4a16 16 0 0 0 6.79 13.08Z" />
      <rect x="44" y="144" width="308" height="224" rx="16" ry="16" />
    </svg>
  ),
  // … keep your other icons (briefcaseOutline etc.) for other notification types
};

const ParentNotifications = () => {
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('userId'));
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestCryRoom, setLatestCryRoom] = useState(null);

  // Fetch regular notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications?userId=${userId}&userRole=Parent`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchNotifications();
  }, [userId]);

  // Poll for the latest cry alert every 5 seconds
  useEffect(() => {
    const checkCryAlert = async () => {
      try {
        const res = await fetch(`${API_BASE}/cry-detection/latest`);
        if (res.ok) {
          const data = await res.json();
          // Store the room name so we can display a cry alert card
          setLatestCryRoom(data.RoomName);
        } else {
          setLatestCryRoom(null);
        }
      } catch (err) {
        // ignore errors (backend may not be running)
      }
    };

    checkCryAlert();
    const interval = setInterval(checkCryAlert, 5000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev =>
      prev.map(n => (n.NotificationId === id ? { ...n, IsRead: true } : n))
    );
  };

  const clearAll = async () => {
    await fetch(`${API_BASE}/notifications/clear?userId=${userId}&userRole=Parent`, { method: 'DELETE' });
    setNotifications([]);
  };

  const handleAction = (notif) => {
    if (notif.NotificationId) markAsRead(notif.NotificationId);
    if (notif.Type === 'job_accepted' || notif.Type === 'job_completed') {
      navigate('/parent-my-jobs');
    } else if (notif.Type === 'shift_started') {
      navigate('/parent-active-job');
    }
    // cry alerts are handled separately (see below)
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f5c6d6, #b2d8d8)', paddingBottom: '100px' }}>
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => navigate(-1)} style={{ background: '#ffffff', borderRadius: '50%', width: 45, height: 45, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <Icons.arrowBack />
          </div>
          <h2 style={{ margin: 0 }}>Notifications</h2>
          <div onClick={clearAll} style={{ background: '#fff', padding: '8px 12px', borderRadius: 20, fontSize: 12, color: orange, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
            Clear
          </div>
        </div>

        {/* Cry Alert Card (if latestCryRoom exists) */}
        {latestCryRoom && (
          <div style={{ background: '#FFF8F9', borderRadius: 24, padding: 30, marginTop: 20, textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
            <div style={{ background: '#FFE5E8', width: 80, height: 80, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', color: '#FF4D6D' }}>
              <Icons.notifications />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 24, color: '#2D3142' }}>Baby is crying</h2>
            <button
              onClick={() => navigate('/cry-alert', { state: { roomName: latestCryRoom } })}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '14px 0', marginTop: 20,
                background: orange, color: '#fff', borderRadius: 16, border: 'none',
                fontWeight: 600, fontSize: 16, cursor: 'pointer'
              }}
            >
              <Icons.videocam /> View Camera
            </button>
          </div>
        )}

        {/* Regular Notifications */}
        <div style={{ marginTop: 20 }}>
          {loading && <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>}
          {!loading && notifications.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60, color: '#bbb' }}>No other notifications</div>
          )}

          {notifications.map((notif) => {
            // Skip cry alerts here – we handle them above
            if (notif.Type === 'cry_alert' || notif.Type?.startsWith('cry_alert:')) return null;

            const IconComp = notif.Type === 'shift_started' ? Icons.notifications : Icons.notifications;
            return (
              <div key={notif.NotificationId} style={{ background: '#fff', borderRadius: 20, padding: 15, boxShadow: '0 4px 10px rgba(0,0,0,0.08)', marginBottom: 15, opacity: notif.IsRead ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ background: '#fff3e0', borderRadius: '50%', width: 45, height: 45, display: 'flex', justifyContent: 'center', alignItems: 'center', color: orange, fontSize: 22 }}>
                      <IconComp />
                    </div>
                    <div>
                      <h4 style={{ margin: 0 }}>
                        {notif.Type === 'shift_started' ? 'Shift Started' :
                         notif.Type === 'job_accepted' ? 'Job Accepted' :
                         notif.Type === 'job_completed' ? 'Job Completed' : 'Notification'}
                      </h4>
                      <p style={{ margin: '5px 0', fontSize: 13, color: '#666' }}>{notif.Message}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {new Date(notif.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => handleAction(notif)} style={{ background: orange, color: '#fff', border: 'none', borderRadius: 20, padding: '10px 15px', cursor: 'pointer' }}>
                    {notif.Type === 'shift_started' ? 'Live View' :
                     notif.Type === 'job_completed' ? 'Leave Review' : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ParentBottomNav />
    </div>
  );
};

export default ParentNotifications;