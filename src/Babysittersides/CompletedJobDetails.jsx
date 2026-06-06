import { useNavigate, useLocation } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  calendarOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  timeOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  locationOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  happyOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  cashOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <line x1="6" y1="6" x2="6" y2="6.01" />
    </svg>
  ),
  walletOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="9" x2="16" y2="9" />
      <path d="M16 15h.01" />
    </svg>
  ),
};

const CompletedJobDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;

  if (!job) {
    return <div style={{ padding: '20px' }}>No job details available. <button onClick={() => navigate(-1)}>Go Back</button></div>;
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const timeRange = job.SlotTimes?.length > 0
    ? `${job.SlotTimes[0].StartTime?.substring(0,5)} - ${job.SlotTimes[job.SlotTimes.length-1].EndTime?.substring(0,5)}`
    : 'TBD';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f5c6d6 0%, #c8d8e8 100%)', paddingBottom: '60px' }}>
      <div style={{ padding: '0 0 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 20px 12px', position: 'relative' }}>
          <div onClick={() => navigate(-1)} style={{ position: 'absolute', left: '20px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
            <Icons.arrowBack />
          </div>
          <h2 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#1a1a1a' }}>Job Details</h2>
        </div>

        <div style={{ padding: '4px 16px 0' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: '#e6f9f0', border: '1px solid #b2e8cc', borderRadius: '20px', padding: '6px 18px', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#27ae60', letterSpacing: '1px', textTransform: 'uppercase' }}>Job Completed</span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#888' }}>This job has been successfully completed.</p>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '16px 18px', marginBottom: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 3px 8px rgba(0,0,0,0.12)' }}>
                <img src={job.ParentPic ? `https://localhost:44368/Images/${job.ParentPic}` : 'https://i.pravatar.cc/54'} alt="parent" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>{job.ParentName || 'Parent'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#f5a623', fontSize: '13px', fontWeight: '700' }}>★ {job.ParentRating ? job.ParentRating.toFixed(1) : 'N/A'}</span>
                  <span style={{ color: '#ccc', fontSize: '13px' }}>•</span>
                  <span style={{ fontSize: '13px', color: '#aaa' }}>ID: {job.Parent_ID || 'N/A'}</span>
                </div>
              </div>
            </div>
            <button style={{ width: '100%', padding: '13px', borderRadius: '30px', background: '#fff', border: `1.5px solid ${orange}`, color: orange, fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Message Parent
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '4px 18px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <InfoRow icon="calendarOutline" label="Date" value={formatDate(job.JobDate)} />
            <InfoRow icon="timeOutline" label="Time" value={timeRange} />
            <InfoRow icon="locationOutline" label="Location" value={job.City || 'N/A'} />
            <InfoRow icon="happyOutline" label="Child" value={`${job.ChildName || 'Child'}, ${job.ChildAge || '?'} Yrs`} />
            <InfoRow icon="cashOutline" label="Payment Rate" value={`PKR ${job.Payment || 0} / hr`} />
            <InfoRow icon="walletOutline" label="Total Earned" value={`PKR ${job.Payment || 0}`} valueColor={orange} last />
          </div>
        </div>
      </div>
      <BabysitterBottomNav />
    </div>
  );
};

const InfoRow = ({ icon, label, value, valueColor, last }) => {
  const IconComp = Icons[icon] || (() => null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: last ? 'none' : '1px solid #f5f5f5' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconComp />
        <span style={{ fontSize: '14px', color: '#999' }}>{label}</span>
      </div>
      <span style={{ fontSize: '14px', fontWeight: '600', color: valueColor || '#1a1a1a' }}>{value}</span>
    </div>
  );
};

export default CompletedJobDetails;