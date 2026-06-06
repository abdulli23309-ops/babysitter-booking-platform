import { useNavigate, useLocation } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=12';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `api/images/${type}/${filename}`;
  }
  return `api/images/default/${pic}`;
};

const Icons = {
  back: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  ),
  calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  ),
  clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  location: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  earnings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  message: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
};

const UpcomingJobDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job || {};

  const parentName    = job.ParentName   || 'Farhan Raza';
  const parentRating  = job.ParentRating || '4.8';
  const parentPic     = buildImageUrl(job.ParentPic);
  const jobDate       = job.JobDate      || '20 March 2026';
  const startTime     = job.SlotTimes?.[0]?.StartTime?.substring(0,5) || '05:00';
  const endTime       = job.SlotTimes?.[job.SlotTimes.length-1]?.EndTime?.substring(0,5) || '09:00';
  const city          = job.City         || 'G8/1, Islamabad';
  const payment       = job.Payment      || '500';

  // Determine banner text from job status
  const bannerText = job.Status === 'In Progress' ? 'In Progress' : 'Job Confirmed';
  const bannerSub = job.Status === 'In Progress'
    ? 'This job is currently active.'
    : 'You have been assigned to this job.';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, #f5c6d6 0%, #dce8f0 60%, #cdd8e8 100%)',
      paddingBottom: '100px',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>

      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 20px 16px',
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute', left: '20px',
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            cursor: 'pointer',
          }}
        >
          <Icons.back />
        </button>
        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>
          Job Details
        </h2>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Status Banner */}
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          padding: '18px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: '#e8f5e9',
            border: `1.5px solid #27ae60`,
            borderRadius: '20px',
            padding: '5px 16px',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#27ae60', letterSpacing: '1px' }}>
              {bannerText}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            {bannerSub}
          </p>
        </div>

        {/* Parent Card */}
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          padding: '16px 18px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <img
              src={parentPic}
              alt="parent"
              style={{
                width: '52px', height: '52px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #f0f0f0',
              }}
              onError={(e) => { e.target.src = 'https://i.pravatar.cc/60?img=12'; }}
            />
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>
                {parentName}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span style={{ fontSize: '12px', color: '#888' }}>
                  {Number(parentRating).toFixed(1)} star rating
                </span>
              </div>
            </div>
          </div>

          <button style={{
            width: '100%',
            padding: '13px',
            background: '#fff',
            border: `1.5px solid ${orange}`,
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            color: orange,
          }}>
            <Icons.message />
            Message Parent
          </button>
        </div>

        {/* Job Info Card */}
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          padding: '6px 18px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          {[
            { icon: <Icons.calendar />, label: 'Date',         value: jobDate,                        valueColor: '#1a1a1a', bold: true },
            { icon: <Icons.clock />,    label: 'Time',         value: `${startTime} - ${endTime}`,    valueColor: '#1a1a1a', bold: true },
            { icon: <Icons.location />, label: 'Location',     value: city,                           valueColor: '#1a1a1a', bold: false },
            { icon: <Icons.earnings />, label: 'Your Earnings',value: `PKR ${payment}/hr`,            valueColor: orange,   bold: true },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {row.icon}
                <span style={{ fontSize: '13px', color: '#888' }}>{row.label}</span>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: row.bold ? '700' : '500',
                color: row.valueColor,
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BabysitterBottomNav />
    </div>
  );
};

export default UpcomingJobDetails;