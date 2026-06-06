import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const orange = '#E8622A';

// ---------- SVG Icons ----------
const Icons = {
  chevronBack: () => (
    <svg width="20" height="20" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="328 112 184 256 328 400" />
    </svg>
  ),
  settings: () => (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M262.29 192.31a64 64 0 1 0 57.4 57.4 64.13 64.13 0 0 0-57.4-57.4ZM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22 155.3 155.3 0 0 1-21.46-12.57 16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22 155.3 155.3 0 0 1 21.46 12.57 16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47Z" />
    </svg>
  ),
  videocam: () => (
    <svg width="26" height="26" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M374.79 308.78 457.5 367a16 16 0 0 0 22.5-14.62V159.62A16 16 0 0 0 457.5 145l-82.71 58.22A16 16 0 0 0 368 216.3v79.4a16 16 0 0 0 6.79 13.08Z" />
      <rect x="44" y="144" width="308" height="224" rx="16" ry="16" />
    </svg>
  ),
  mic: () => (
    <svg width="26" height="26" viewBox="0 0 512 512" fill="white" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M256 352a96 96 0 0 0 96-96V160a96 96 0 0 0-192 0v96a96 96 0 0 0 96 96Z" />
      <path d="M160 256c0 52.93 43.06 96 96 96s96-43.07 96-96" fill="none" strokeWidth="32"/>
      <line x1="256" y1="352" x2="256" y2="432" strokeWidth="32"/>
      <line x1="192" y1="432" x2="320" y2="432" strokeWidth="32"/>
    </svg>
  ),
  callEnd: () => (
    <svg width="26" height="26" viewBox="0 0 512 512" fill="white" stroke="white" strokeWidth="8">
      <path d="M497 370.13c-8.33-16.67-31.9-26.3-31.9-26.3l-86.7-38.87c-18.33-8.34-41.67-.83-51.67 11.67l-37.5 45.84c-62.5-31.67-107.29-78.33-135.42-135.42l45.84-37.5c12.5-10 20-33.33 11.67-51.67l-38.87-86.7S164.78 23.55 148.11 15.22C130.61 6.89 92.78 15.22 92.78 15.22l-72.9 72.9c-11.67 11.67-16.67 27.5-12.5 45 16.67 75 83.33 195 156.25 268.75 73.75 72.92 193.75 139.58 268.75 156.25 17.5 4.17 33.33-.83 45-12.5l72.9-72.9s8.33-37.83 0-54.59Z" />
    </svg>
  ),
  shield: () => (
    <svg width="12" height="12" viewBox="0 0 512 512" fill="white" stroke="white" strokeWidth="8">
      <path d="M256 32 32 144v112c0 121.84 82.08 235.68 224 272 141.92-36.32 224-150.16 224-272V144Z" />
    </svg>
  ),
  thermometer: () => (
    <svg width="11" height="11" viewBox="0 0 512 512" fill="white" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M352 80a80 80 0 0 0-160 0v214.68a144 144 0 1 0 160 0Z" />
      <line x1="256" y1="272" x2="256" y2="416" />
      <circle cx="256" cy="416" r="48" fill="white" stroke="none"/>
    </svg>
  ),
  drop: () => (
    <svg width="11" height="11" viewBox="0 0 512 512" fill="white" stroke="white" strokeWidth="8">
      <path d="M256 32C198 109 128 191.06 128 260a128 128 0 0 0 256 0c0-69-70-151-128-228Z" />
    </svg>
  ),
  homeOutline: () => (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M80 212v236a16 16 0 0 0 16 16h96V328a24 24 0 0 1 24-24h80a24 24 0 0 1 24 24v136h96a16 16 0 0 0 16-16V212" />
      <path d="M480 256 266.89 52c-5-4.67-11.56-7.05-18.33-7-6.78.05-13.33 2.43-18.33 7L32 256" />
    </svg>
  ),
  dashboardOutline: () => (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <rect x="48" y="48" width="176" height="176" rx="20" />
      <rect x="288" y="48" width="176" height="176" rx="20" />
      <rect x="48" y="288" width="176" height="176" rx="20" />
      <rect x="288" y="288" width="176" height="176" rx="20" />
    </svg>
  ),
  personOutline: () => (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96Z" />
      <path d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304Z" />
    </svg>
  ),
  findSitter: () => (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none" stroke={orange} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96Z" />
      <path d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304Z" />
      <circle cx="390" cy="380" r="52" stroke={orange} strokeWidth="30" fill="none" />
      <line x1="428" y1="418" x2="464" y2="454" strokeWidth="30" />
    </svg>
  ),
  moreOutline: () => (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round">
      <line x1="88" y1="152" x2="424" y2="152" />
      <line x1="88" y1="256" x2="424" y2="256" />
      <line x1="88" y1="360" x2="424" y2="360" />
    </svg>
  ),
};

// ---------- Nursery Camera Scene ----------
const NurseryCameraFeed = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%', background: '#e8e0d8', overflow: 'hidden' }}>
    <svg width="100%" height="100%" viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      {/* Wall */}
      <rect width="360" height="230" fill="#f0ece6" />
      {/* Floor */}
      <rect x="0" y="175" width="360" height="55" fill="#ddd5c8" />

      {/* Back wall shade */}
      <rect x="0" y="0" width="360" height="175" fill="#f5f1ec" />

      {/* Wall art frame 1 */}
      <rect x="100" y="18" width="65" height="82" rx="4" fill="#c8a87a" />
      <rect x="105" y="23" width="55" height="72" rx="3" fill="#e8d9c4" />
      {/* Giraffe art */}
      <ellipse cx="132" cy="52" rx="12" ry="16" fill="#c8956a" opacity="0.7"/>
      <rect x="128" y="62" width="4" height="20" rx="2" fill="#c8956a" opacity="0.7"/>
      <rect x="136" y="62" width="4" height="20" rx="2" fill="#c8956a" opacity="0.7"/>
      <ellipse cx="132" cy="42" rx="7" ry="9" fill="#c8956a" opacity="0.7"/>
      <rect x="130" y="33" width="3" height="8" rx="1" fill="#c8956a" opacity="0.7"/>

      {/* Wall art frame 2 */}
      <rect x="185" y="18" width="65" height="82" rx="4" fill="#c8a87a" />
      <rect x="190" y="23" width="55" height="72" rx="3" fill="#e8d9c4" />
      {/* Floral art */}
      <circle cx="217" cy="55" r="18" fill="none" stroke="#c8956a" strokeWidth="2" opacity="0.6"/>
      <circle cx="217" cy="55" r="10" fill="none" stroke="#c8956a" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="217" cy="55" r="4" fill="#c8956a" opacity="0.5"/>
      {[0,60,120,180,240,300].map((a,i) => (
        <ellipse key={i} cx={217 + 18*Math.cos(a*Math.PI/180)} cy={55 + 18*Math.sin(a*Math.PI/180)} rx="4" ry="6"
          transform={`rotate(${a}, ${217 + 18*Math.cos(a*Math.PI/180)}, ${55 + 18*Math.sin(a*Math.PI/180)})`}
          fill="#c8956a" opacity="0.4"/>
      ))}

      {/* Dresser / cabinet right */}
      <rect x="295" y="80" width="65" height="110" rx="6" fill="#c4a472" />
      <rect x="300" y="86" width="55" height="48" rx="4" fill="#d4b482" />
      <rect x="300" y="140" width="55" height="44" rx="4" fill="#d4b482" />
      <circle cx="327" cy="112" r="4" fill="#a08050" />
      <circle cx="327" cy="163" r="4" fill="#a08050" />
      {/* Items on top of dresser */}
      <rect x="300" y="68" width="20" height="14" rx="3" fill="#d4c4a8" />
      <rect x="326" y="62" width="12" height="20" rx="3" fill="#e8d4b8" />
      <rect x="342" y="66" width="14" height="16" rx="3" fill="#c8b890" />

      {/* Plant left */}
      <rect x="18" y="158" width="20" height="20" rx="4" fill="#8B6914" />
      <ellipse cx="28" cy="155" rx="28" ry="22" fill="#3a7a3a" />
      <ellipse cx="15" cy="148" rx="18" ry="14" fill="#4a8a4a" />
      <ellipse cx="42" cy="148" rx="16" ry="12" fill="#2a6a2a" />
      <ellipse cx="28" cy="138" rx="12" ry="16" fill="#3a7a3a" />
      {/* Leaf lines */}
      <line x1="28" y1="155" x2="10" y2="140" stroke="#2a6030" strokeWidth="1.5" opacity="0.5"/>
      <line x1="28" y1="155" x2="46" y2="142" stroke="#2a6030" strokeWidth="1.5" opacity="0.5"/>
      <line x1="28" y1="155" x2="28" y2="130" stroke="#2a6030" strokeWidth="1.5" opacity="0.5"/>

      {/* Crib */}
      {/* Crib back panel */}
      <rect x="68" y="108" width="220" height="75" rx="8" fill="#d4b896" />
      {/* Crib mattress */}
      <rect x="73" y="148" width="210" height="28" rx="4" fill="#e8ddd0" />
      {/* Crib front rail */}
      <rect x="68" y="140" width="220" height="10" rx="4" fill="#c4a880" />
      {/* Left post */}
      <rect x="62" y="100" width="14" height="90" rx="6" fill="#c4a880" />
      {/* Right post */}
      <rect x="280" y="100" width="14" height="90" rx="6" fill="#c4a880" />
      {/* Crib slats */}
      {Array.from({length: 14}, (_, i) => (
        <rect key={i} x={80 + i * 15} y={112} width="5" height="62" rx="2.5" fill="#c8ac86" />
      ))}
      {/* Crib legs */}
      <rect x="68" y="185" width="10" height="20" rx="4" fill="#b89870" />
      <rect x="278" y="185" width="10" height="20" rx="4" fill="#b89870" />
      {/* Inside crib - mattress texture */}
      <rect x="80" y="152" width="196" height="18" rx="3" fill="#f0e8dc" />

      {/* Floor shadow under crib */}
      <ellipse cx="178" cy="204" rx="100" ry="6" fill="#00000015"/>
    </svg>

    {/* Overlay badges */}
    {/* Temp */}
    <div style={{
      position: 'absolute', top: '10px', left: '10px',
      background: 'rgba(0,0,0,0.45)', borderRadius: '20px',
      padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px',
      backdropFilter: 'blur(4px)',
    }}>
      <Icons.thermometer />
      <span style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>22°C</span>
    </div>

    {/* Humidity */}
    <div style={{
      position: 'absolute', top: '10px', left: '78px',
      background: 'rgba(0,0,0,0.45)', borderRadius: '20px',
      padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px',
      backdropFilter: 'blur(4px)',
    }}>
      <Icons.drop />
      <span style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>45%</span>
    </div>

    {/* Secure Connection */}
    <div style={{
      position: 'absolute', bottom: '10px', right: '10px',
      background: 'rgba(0,0,0,0.45)', borderRadius: '20px',
      padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px',
      backdropFilter: 'blur(4px)',
    }}>
      <Icons.shield />
      <span style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>Secure Connection</span>
    </div>
  </div>
);

// ---------- Main Screen ----------
const BabyMonitoringScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [micOn, setMicOn] = useState(true);

  const navItems = [
    { icon: Icons.homeOutline, label: 'Home', path: '/main-screen' },
    { icon: Icons.dashboardOutline, label: 'Dashboard', path: '/dashboard' },
    { icon: Icons.personOutline, label: 'Profile', path: '/parent-profile' },
    { icon: Icons.findSitter, label: 'FIND SITTER', path: '/find-sitter', active: true },
    { icon: Icons.moreOutline, label: 'More', path: '/more' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F2DFEE 0%, #D8EAF5 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', sans-serif",
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 8px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#333', display: 'flex', alignItems: 'center',
            padding: '4px',
          }}
        >
          <Icons.chevronBack />
        </button>
        <h2 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#1a1a2e' }}>
          Little Care
        </h2>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '4px' }}>
          <Icons.settings />
        </button>
      </div>

      {/* LIVE badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#fff', borderRadius: '20px', padding: '5px 16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4D6D', display: 'inline-block' }} />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', letterSpacing: '1px' }}>LIVE</span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#666', fontWeight: '500' }}>
          Nursery · HD 1080p
        </p>
      </div>

      {/* Camera Feed */}
      <div style={{
        margin: '0 18px',
        borderRadius: '20px',
        overflow: 'hidden',
        height: '230px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
        border: '1px solid rgba(255,255,255,0.8)',
      }}>
        <NurseryCameraFeed />
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: '32px', marginTop: '36px',
      }}>
        {/* Camera button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button style={{
            width: '62px', height: '62px', borderRadius: '50%',
            background: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)', color: '#333',
          }}>
            <Icons.videocam />
          </button>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#888', letterSpacing: '0.5px' }}>CAMERA</span>
        </div>

        {/* Mic button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setMicOn(!micOn)}
            style={{
              width: '62px', height: '62px', borderRadius: '50%',
              background: micOn ? orange : '#ddd',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 16px ${micOn ? 'rgba(232,98,42,0.35)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <Icons.mic />
          </button>
          <span style={{
            fontSize: '11px', fontWeight: '700',
            color: micOn ? orange : '#888',
            letterSpacing: '0.5px',
          }}>
            {micOn ? 'MIC ON' : 'MIC OFF'}
          </span>
        </div>

        {/* End button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '62px', height: '62px', borderRadius: '50%',
              background: '#E53935', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(229,57,53,0.35)',
            }}
          >
            <Icons.callEnd />
          </button>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#888', letterSpacing: '0.5px' }}>END</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', paddingBottom: '18px', paddingTop: '10px',
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
        borderTop: '1px solid rgba(0,0,0,0.06)', zIndex: 100,
      }}>
        {navItems.map((item) => {
          const isActive = item.active || location.pathname === item.path;
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
            >
              <div style={{ color: isActive ? orange : '#aaa' }}>
                <item.icon />
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? orange : '#aaa',
                letterSpacing: isActive ? '0.3px' : '0',
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BabyMonitoringScreen;