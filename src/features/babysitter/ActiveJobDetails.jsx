import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const orange = '#E8622A';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

const Icons = {
  chevronBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  ),
  locationOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  cashOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function ActiveJobDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!job || !job.SlotTimes?.length) return;
    const startTimeStr = job.SlotTimes[0].StartTime;
    if (!startTimeStr) return;
    const [hours, minutes] = startTimeStr.split(':');
    const start = new Date(job.JobDate || Date.now());
    start.setHours(Number(hours), Number(minutes), 0, 0);

    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
      setElapsed(diff);
    }, 1000);
    return () => clearInterval(timer);
  }, [job]);

  const formatTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!job) {
    return (
      <div style={{
        minHeight: '100vh',
        maxWidth: 'var(--shell-max-width, 480px)',
        margin: '0 auto',
        background: 'var(--color-background, #FAFBFD)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 16px 100px',
        boxSizing: 'border-box',
      }}>
        <EmptyState
          icon="📋"
          title="No Active Job Details"
          description="We couldn't retrieve the session details for this job. It may have ended or been updated."
        >
          <Button
            variant="primary"
            onClick={() => navigate('/babysitter-my-jobs')}
            style={{ marginTop: '12px' }}
          >
            Back to Assigned Jobs
          </Button>
        </EmptyState>
        <BabysitterBottomNav />
      </div>
    );
  }

  const childAge = job.ChildAge ?? (job.Child_DOB ? calculateAge(job.Child_DOB) : '?');

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--shell-max-width, 480px)',
      margin: '0 auto',
      background: 'linear-gradient(170deg, #f5c6d6 0%, #c8d8e8 100%)',
      paddingBottom: '100px',
      boxSizing: 'border-box',
    }}>
      <div style={{ padding: '24px 16px 100px' }}>
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <BackButton />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>
            Active Session
          </h2>
          <div style={{ width: '42px' }} />
        </div>

        {/* ── Parent Card ── */}
        <div style={{
          background: '#fff',
          borderRadius: '22px',
          padding: '16px 18px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '28px',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={buildImageUrl(job.ParentPic)}
              alt="parent"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #fff',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              }}
              onError={(e) => { e.target.src = 'https://i.pravatar.cc/60'; }}
            />
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '18px',
              height: '18px',
              background: '#27ae60',
              borderRadius: '50%',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.8">
                <path d="M2 5l2 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div>
            <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>
              {job.ParentName || 'Parent'}
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#999' }}>
              ID: PK-{String(job.Job_ID).padStart(5, '0')}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#fff5ef',
              borderRadius: '20px',
              padding: '4px 10px',
            }}>
              <span style={{ fontSize: '14px' }}>☺</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: orange }}>
                {job.ChildName || 'Child'} ({childAge}y)
              </span>
            </div>
          </div>
        </div>

        {/* ── Live Duration Timer ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '28px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            width: '290px',
            height: '290px',
            borderRadius: '50%',
            border: '1.5px solid rgba(180,180,200,0.30)',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            <p style={{
              margin: '0 0 8px',
              fontSize: '11px',
              fontWeight: '700',
              color: orange,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}>
              Live Duration
            </p>

            <h1 style={{
              margin: '0 0 12px',
              fontSize: '36px',
              fontWeight: '800',
              color: '#1a1a1a',
              letterSpacing: '1px',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'monospace',
              lineHeight: 1,
            }}>
              {formatTime(elapsed)}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#27ae60',
                boxShadow: '0 0 0 3px rgba(39,174,96,0.2)',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Started at {job.SlotTimes?.[0]?.StartTime?.substring(0, 5) || '?'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Info Card ── */}
        <div style={{
          background: '#fff',
          borderRadius: '22px',
          padding: '6px 18px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
        }}>
          {/* Location row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 0',
            borderBottom: '1px solid #f5f5f5',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#eef4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icons.locationOutline />
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Location
              </p>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '15px', color: '#1a1a1a' }}>
                {job.City || 'N/A'}
              </p>
            </div>
          </div>

          {/* Payment row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '16px 0',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#e8f8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icons.cashOutline />
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Payment Rate
              </p>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '15px', color: '#1a1a1a' }}>
                PKR {job.Payment}/hr
              </p>
            </div>
          </div>
        </div>
      </div>

      <BabysitterBottomNav />
    </div>
  );
}

