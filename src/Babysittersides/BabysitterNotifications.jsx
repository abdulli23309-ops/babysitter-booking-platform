import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';
const API_BASE = '/api';

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  playCircleOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M8 5.14l11 7.36-11 7.36V5.14z" />
    </svg>
  ),
  briefcaseOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  notificationsOutline: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

const BabysitterNotifications = () => {
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem('userId'));
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications?userId=${userId}&userRole=Sitter`);
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

  const markAsRead = async (id) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev =>
      prev.map(n => (n.NotificationId === id ? { ...n, IsRead: true } : n))
    );
  };

  const clearAll = async () => {
    await fetch(`${API_BASE}/notifications/clear?userId=${userId}&userRole=Sitter`, { method: 'DELETE' });
    setNotifications([]);
  };

  const handleAction = (notif) => {
    markAsRead(notif.NotificationId);
    if (notif.Type === 'shift') {
      navigate('/active-job-details'); // needs job data passed in state
    } else if (notif.Type === 'match') {
      navigate('/job-details/' + notif.RelatedId); // if you store the jobId
    } else if (notif.Type === 'request') {
      // already handled by accept/decline buttons
    }
  };

  const dismissRequest = async (id) => {
    // For simplicity, we just mark as read (decline action)
    await markAsRead(id);
    // Optionally call an API to reject the job
    setNotifications(prev => prev.filter(n => n.NotificationId !== id));
  };

  const iconForType = (type) => {
    switch (type) {
      case 'shift': return 'playCircleOutline';
      case 'match': return 'briefcaseOutline';
      default: return 'notificationsOutline';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f5c6d6 0%, #c8d8e8 100%)', paddingBottom: '80px' }}>
      <div style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px' }}>
          <div onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
            <Icons.arrowBack />
          </div>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>Notifications</h2>
          <button onClick={clearAll} style={{ background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '20px', padding: '8px 14px', fontSize: 12, fontWeight: 600, color: orange, cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.07)' }}>
            Clear Notifications
          </button>
        </div>

        <div style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading && <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>}
          {!loading && notifications.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60, color: '#bbb', fontSize: 15 }}>No notifications</div>
          )}

          {notifications.map((notif) => {
            const IconComp = Icons[iconForType(notif.Type)] || Icons.notificationsOutline;
            return (
              <div key={notif.NotificationId} style={{ background: '#fff', borderRadius: 22, padding: 18, boxShadow: '0 4px 14px rgba(0,0,0,0.06)', opacity: notif.IsRead ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff5ef', border: '1.5px solid #f5ddd0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComp />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
                        {notif.Type === 'shift' ? 'Shift Started' : notif.Type === 'match' ? 'New Job Match' : notif.Type === 'request' ? 'New Job Request' : 'Notification'}
                      </span>
                      <span style={{ fontSize: 12, color: '#bbb' }}>
                        {new Date(notif.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: '#777', lineHeight: 1.5 }}>{notif.Message}</p>
                  </div>
                </div>

                {notif.Type === 'shift' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAction(notif)} style={{ padding: '10px 22px', borderRadius: 30, border: `1.5px solid ${orange}`, background: '#fff', color: orange, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>View Job</button>
                  </div>
                )}

                {notif.Type === 'match' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleAction(notif)} style={{ padding: '10px 22px', borderRadius: 30, border: 'none', background: orange, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,98,42,0.35)' }}>View Details</button>
                  </div>
                )}

                {notif.Type === 'request' && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <button onClick={() => handleAction(notif)} style={{ flex: 1, padding: 12, borderRadius: 30, border: 'none', background: orange, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,98,42,0.35)' }}>Accept</button>
                    <button onClick={() => dismissRequest(notif.NotificationId)} style={{ flex: 1, padding: 12, borderRadius: 30, border: '1.5px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Decline</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <BabysitterBottomNav />
    </div>
  );
};

export default BabysitterNotifications;