import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';
import { API } from '../Services/api';

const orange = '#E8622A';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/60';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `api/images/${type}/${filename}`;
  }
  return `api/images/default/${pic}`;
};

const SLOT_TIME_MAP = {
  1: { start: '08:00', end: '10:00' },
  2: { start: '10:00', end: '12:00' },
  3: { start: '12:00', end: '14:00' },
  4: { start: '14:00', end: '16:00' },
  5: { start: '16:00', end: '18:00' },
  6: { start: '18:00', end: '20:00' },
  7: { start: '20:00', end: '22:00' },
};

const formatTime = (time24) => {
  const [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
};

const getTimeRangeFromSlots = (slotIds) => {
  if (!slotIds || slotIds.length === 0) return 'Time not specified';
  const times = slotIds
    .map(id => SLOT_TIME_MAP[id])
    .filter(t => t)
    .sort((a, b) => a.start.localeCompare(b.start));
  if (times.length === 0) return 'Time not specified';
  return `${formatTime(times[0].start)} – ${formatTime(times[times.length - 1].end)}`;
};

const Icons = {
  arrowBack: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFB400" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  calendarOutline: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  timeOutline: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  locationOutline: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  cashOutline: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <line x1="6" y1="6" x2="6" y2="6.01" />
    </svg>
  ),
};

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        const data = await API.getJobDetails(parseInt(jobId));
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const handleConfirm = async () => {
    const sitterId = Number(localStorage.getItem('userId'));
    if (!sitterId) return;
    try {
      await API.confirmJob(parseInt(jobId), sitterId);
     navigate('/job-accepted-success');
    } catch {
      alert('Failed to confirm job.');
    }
  };

  const handleReject = async () => {
    try {
      await API.rejectJob(parseInt(jobId));
      alert('Job Rejected ❌');
      navigate('/job-request');
    } catch {
      alert('Failed to reject job.');
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#f5c6d6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading job details...</div>;
  }
  if (!job) {
    return <div style={{ minHeight: '100vh', background: '#f5c6d6', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}><p>No job data found ❌</p><button onClick={() => navigate(-1)}>Go Back</button></div>;
  }

  const rating = job.ParentRating ?? job.Rating ?? 0;
  const slotIds = job.SlotIds || [];
  const timeRange = getTimeRangeFromSlots(slotIds);
  const formattedDate = job.JobDate ? new Date(job.JobDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set';
  const location = job.City || job.ParentAddress || 'Location not provided';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f5c6d6, #b2d8d8)', paddingBottom: '100px' }}>
      <div style={{ padding: '20px 16px 100px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div onClick={() => navigate(-1)} style={{ background: '#fff', borderRadius: '50%', width: 44, height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <Icons.arrowBack />
          </div>
          <h2 style={{ margin: 0, marginLeft: 16, fontSize: 22, fontWeight: 700 }}>Job Details</h2>
        </div>

        {/* Parent Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer' }} onClick={() => navigate(`/job-parent-profile/${jobId}`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={buildImageUrl(job.ParentPic)} alt="parent" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{job.ParentName || 'Parent Name'}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>Member since 2022</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icons.locationOutline style={{ fontSize: 14 }} />
                {job.ParentAddress || 'Address not available'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FFB400' }}>
              <Icons.star />
              <span style={{ fontWeight: 600, color: '#333' }}>{Number(rating).toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Child Info */}
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Child Information</h3>
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} onClick={() => navigate(`/job-child-profile/${jobId}`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={buildImageUrl(job.PictureAddress)} alt="child" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>{job.ChildName || 'Child Name'}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>Age: {job.ChildAge ?? 'N/A'} Years Old</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555' }}>Gender: {job.Gender || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Job Specifics */}
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Job Specifics</h3>
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Icons.calendarOutline />
            <div><div style={{ fontSize: 12, color: '#999' }}>DATE</div><div style={{ fontWeight: 600 }}>{formattedDate}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Icons.timeOutline />
            <div><div style={{ fontSize: 12, color: '#999' }}>TIME</div><div style={{ fontWeight: 600 }}>{timeRange}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Icons.locationOutline />
            <div><div style={{ fontSize: 12, color: '#999' }}>LOCATION</div><div style={{ fontWeight: 600 }}>{location}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icons.cashOutline />
            <div><div style={{ fontSize: 12, color: '#999' }}>PAYMENT</div><div style={{ fontWeight: 600 }}>{job.Payment ?? 0} PKR/hr</div></div>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'transparent', padding: '10px 16px 20px' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleReject} style={{ flex: 1, background: '#e53935', color: '#fff', borderRadius: 30, padding: '14px 0', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Reject</button>
          <button onClick={handleConfirm} style={{ flex: 1, background: orange, color: '#fff', borderRadius: 30, padding: '14px 0', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Confirm</button>
        </div>
      </div>
      <BabysitterBottomNav />
    </div>
  );
};

export default JobDetails;