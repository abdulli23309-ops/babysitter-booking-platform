import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

// ---------- SVG Icons ----------
const Icons = {
  chevronBack: () => (
    <svg width="24" height="24" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="328 112 184 256 328 400" />
    </svg>
  ),
  bell: () => (
    <svg width="38" height="38" viewBox="0 0 512 512" fill="none" stroke="#FF4D6D" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M427.68 351.43C402 320 383.87 288 383.87 256c0-61.86-38.45-114.15-88.47-140.33A80.45 80.45 0 0 0 256 48a80.45 80.45 0 0 0-39.4 67.67c-50 26.18-88.47 78.47-88.47 140.33 0 32-18.13 64-43.81 95.43A16 16 0 0 0 96 368h320a16 16 0 0 0 11.68-16.57Z" />
      <path d="M192 400a64 64 0 0 0 128 0" />
    </svg>
  ),
  videocam: () => (
    <svg width="20" height="20" viewBox="0 0 512 512" fill={orange} stroke={orange} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M374.79 308.78 457.5 367a16 16 0 0 0 22.5-14.62V159.62A16 16 0 0 0 457.5 145l-82.71 58.22A16 16 0 0 0 368 216.3v79.4a16 16 0 0 0 6.79 13.08Z" />
      <rect x="44" y="144" width="308" height="224" rx="16" ry="16" />
    </svg>
  ),
};

// ---------- Live Camera Preview (placeholder) ----------
const LiveCameraPreview = () => (
  <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#dde8ea', height: '180px' }}>
    <svg width="100%" height="100%" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="180" fill="#e8eeef" />
      <rect x="85" y="10" width="130" height="110" rx="6" fill="#b8d8e4" />
      <rect x="95" y="18" width="110" height="94" rx="4" fill="#a0cce0" />
      <ellipse cx="140" cy="72" rx="28" ry="35" fill="#4a9e6a" />
      <ellipse cx="175" cy="78" rx="22" ry="28" fill="#3a8e5a" />
      <ellipse cx="158" cy="65" rx="20" ry="24" fill="#5aae7a" />
      <rect x="55" y="128" width="190" height="42" rx="6" fill="#d4b896" />
      <rect x="58" y="118" width="7" height="52" rx="3" fill="#c4a886" />
      <rect x="235" y="118" width="7" height="52" rx="3" fill="#c4a886" />
      {[70, 88, 106, 124, 142, 160, 178, 196, 214].map((x, i) => (
        <rect key={i} x={x} y={128} width="4" height="36" rx="2" fill="#b89876" />
      ))}
      <rect x="246" y="135" width="30" height="28" rx="5" fill="#e0cbb0" />
    </svg>
    <div style={{
      position: 'absolute', top: '10px', left: '10px',
      background: 'rgba(0,0,0,0.5)', borderRadius: '20px',
      padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px',
    }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4D6D', display: 'inline-block' }} />
      <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>LIVE</span>
    </div>
  </div>
);

const ChildCryAlertScreen = () => {
  const navigate = useNavigate();
  const [latestAlert, setLatestAlert] = useState(null);
  const [inCall, setInCall] = useState(false);
  const parentId = Number(localStorage.getItem('userId'));

  // Poll for cry alerts every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/cry-detection/latest?parentId=${parentId}`);
        if (res.ok) {
          const data = await res.json();
          setLatestAlert(data);
        }
      } catch (error) {
        console.error('Error fetching cry alert', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [parentId]);

  const handleJoinCall = () => {
    if (latestAlert?.roomName) {
      setInCall(true);
    }
  };

  // If in a Jitsi call, show the meeting interface
  if (inCall && latestAlert?.roomName) {
    return (
      <div style={{ height: '100vh', position: 'relative' }}>
        <JitsiMeeting
          roomName={latestAlert.roomName}
          domain="meet.jit.si"
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: false,
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'chat', 'tileview', 'fullscreen',
              'raisehand', 'settings', 'hangup'
            ],
          }}
          getIFrameRef={(iframe) => { iframe.style.height = '100vh'; }}
        />
        <button
          onClick={() => setInCall(false)}
          style={{
            position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
            padding: '12px 24px', borderRadius: 99, background: '#ef4444',
            color: '#fff', border: 'none', fontFamily: 'sans-serif', fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Leave Call
        </button>
      </div>
    );
  }

  // Main UI – Cry alert card
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F9E4EE 0%, #DFF0F0 100%)',
      paddingBottom: '100px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#fff',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Icons.chevronBack />
        </button>
        <h2 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#2D3142' }}>Cry Alert</h2>
        <div style={{ width: '38px' }} />
      </div>

      {latestAlert ? (
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          margin: '8px 20px',
          padding: '28px 20px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        }}>
          {/* Bell Icon */}
          <div style={{
            width: '76px', height: '76px', borderRadius: '50%',
            background: '#FFE4EC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Icons.bell />
          </div>

          {/* Alert message with timestamp */}
          <h2 style={{ textAlign: 'center', margin: '0 0 6px', fontWeight: '800', fontSize: '22px', color: '#2D3142' }}>
            Baby is crying loudly
          </h2>
          <p style={{ textAlign: 'center', margin: '0 0 8px', fontSize: '13px', color: '#9098B1' }}>
            Urgent noise detected in the nursery
          </p>
          <p style={{ textAlign: 'center', margin: '0 0 20px', fontSize: '12px', color: '#E8622A', fontWeight: '500' }}>
            {new Date(latestAlert.timestamp).toLocaleTimeString()}
          </p>

          {/* Live Camera Preview */}
          <LiveCameraPreview />

          {/* View Camera Button – joins Jitsi call */}
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={handleJoinCall}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                width: '100%', padding: '16px 0',
                background: orange, border: 'none', borderRadius: '16px',
                fontWeight: '600', fontSize: '16px', color: '#fff',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(232,98,42,0.3)',
              }}
            >
              <Icons.videocam />
              Join Video Call
            </button>
          </div>
        </div>
      ) : (
        // No alert state
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          margin: '40px 20px',
          padding: '48px 20px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: '76px', height: '76px', borderRadius: '50%',
            background: '#E8F0FE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="38" height="38" viewBox="0 0 512 512" fill="none" stroke="#7C8DB0" strokeWidth="32">
              <path d="M427.68 351.43C402 320 383.87 288 383.87 256c0-61.86-38.45-114.15-88.47-140.33A80.45 80.45 0 0 0 256 48a80.45 80.45 0 0 0-39.4 67.67c-50 26.18-88.47 78.47-88.47 140.33 0 32-18.13 64-43.81 95.43A16 16 0 0 0 96 368h320a16 16 0 0 0 11.68-16.57Z" />
              <path d="M192 400a64 64 0 0 0 128 0" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px', fontWeight: '700', color: '#2D3142' }}>No recent alerts</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#9098B1' }}>
            Waiting for cry detection from the babysitter…
          </p>
        </div>
      )}

      {/* Bottom Navigation */}
      <ParentBottomNav />
    </div>
  );
};

export default ChildCryAlertScreen;