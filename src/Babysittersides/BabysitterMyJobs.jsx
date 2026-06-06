import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  time: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  location: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  cash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <line x1="6" y1="6" x2="6" y2="6.01" />
    </svg>
  ),
  baby: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  ),
  chevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimeRange = (slots) => {
  if (!slots?.length) return '—';
  const start = slots[0].StartTime?.substring(0, 5);
  const end = slots[slots.length - 1].EndTime?.substring(0, 5);
  return start && end ? `${start} - ${end}` : '—';
};

const calculateAge = (dob) => {
  if (!dob) return '?';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const BabysitterMyJobs = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const sitterId = Number(localStorage.getItem('userId'));

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/sitter/${sitterId}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
      alert('Could not load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [sitterId]);

  const activeJobs = jobs.filter(j => j.Status === 'In Progress');
  const upcomingJobs = jobs.filter(j => j.Status === 'Assigned');
  const historyJobs = jobs.filter(j => j.Status === 'Completed' || j.Status === 'Cancelled');

  const handleViewDetails = (job) => {
  if (job.Status === 'In Progress') {
    navigate('/active-job-details', { state: { job } });
  } else if (job.Status === 'Assigned') {
    navigate('/upcoming-job-details', { state: { job } });
  } else {
    // Completed or Cancelled
    navigate('/completed-job-details', { state: { job } });
  }
};

  const tabBtnStyle = (tab) => ({
    flex: 1, border: 'none', cursor: 'pointer', borderRadius: '50px', padding: '10px 6px',
    fontSize: '13px', fontWeight: 'bold',
    background: selectedTab === tab ? orange : 'transparent',
    color: selectedTab === tab ? '#fff' : '#888',
    boxShadow: selectedTab === tab ? '0 4px 12px rgba(232,98,42,0.35)' : 'none',
    transition: 'all 0.2s ease',
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDECF2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDECF2 0%, #E0F2F1 100%)', paddingBottom: '100px' }}>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#fff', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer' }}>
            <Icons.arrowBack />
          </button>
          <h2 style={{ margin: 0, fontWeight: '700', fontSize: '20px', color: '#2D3142' }}>My Jobs</h2>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', borderRadius: '50px', padding: '4px', marginBottom: '20px', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <button style={tabBtnStyle('active')} onClick={() => setSelectedTab('active')}>Active</button>
          <button style={tabBtnStyle('upcoming')} onClick={() => setSelectedTab('upcoming')}>Upcoming</button>
          <button style={tabBtnStyle('history')} onClick={() => setSelectedTab('history')}>History</button>
        </div>

        {selectedTab === 'active' && activeJobs.map(job => (
          <JobCard key={job.Job_ID} job={job} statusBadge="In Progress" color={orange} onViewDetails={handleViewDetails} />
        ))}
        {selectedTab === 'upcoming' && upcomingJobs.map(job => (
          <JobCard key={job.Job_ID} job={job} statusBadge="Upcoming" color="#007AFF" onViewDetails={handleViewDetails} />
        ))}
        {selectedTab === 'history' && historyJobs.map(job => (
          <JobCard key={job.Job_ID} job={job} statusBadge="Completed" color="#666" onViewDetails={handleViewDetails} />
        ))}
      </div>
      <BabysitterBottomNav />
    </div>
  );
};

const JobCard = ({ job, statusBadge, color, onViewDetails }) => {
  const childAge = job.ChildAge ?? (job.Child_DOB ? calculateAge(job.Child_DOB) : '?');
  return (
    <div style={{
      background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      marginBottom: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#2D3142' }}>{job.ParentName || 'Parent'}</h3>
          <span style={{ fontSize: '12px', color: '#888' }}>ID: PK-{String(job.Job_ID).padStart(5, '0')}</span>
        </div>
        <span style={{
          background: `${color}20`, color, padding: '3px 10px', borderRadius: '10px',
          fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
        }}>
          {statusBadge}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {job.ChildName && (
          <Row icon="baby" label="CHILD" value={`${job.ChildName} (${childAge}y)`} />
        )}
        <Row icon="cash" label="RATE" value={`PKR ${job.Payment}/hr`} />
        <Row icon="location" label="LOCATION" value={job.City || job.ParentAddress || '—'} />
        <Row icon="calendar" label="SCHEDULE" value={formatDate(job.JobDate)} />
        <Row icon="time" label="TIME" value={formatTimeRange(job.SlotTimes)} />
      </div>

      <div style={{ textAlign: 'right' }}>
        <span onClick={() => onViewDetails(job)} style={{ fontSize: '13px', color: orange, fontWeight: '600', cursor: 'pointer' }}>
          View Details <Icons.chevronRight />
        </span>
      </div>
    </div>
  );
};

const Row = ({ icon, label, value }) => {
  const IconComp = Icons[icon] || Icons.cash;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <IconComp />
      <span style={{ fontSize: '11px', color: '#888', fontWeight: '600', minWidth: '60px' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>{value}</span>
    </div>
  );
};

export default BabysitterMyJobs;