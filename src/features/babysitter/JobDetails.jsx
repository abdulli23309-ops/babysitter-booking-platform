import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import { API } from '../../services/api';
import styles from './job-details.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
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

const formatTime12 = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute || 0).padStart(2, '0')} ${period}`;
};

const getTimeRange = (job) => {
  if (job?.SlotTimes && job.SlotTimes.length > 0) {
    const start = job.SlotTimes[0].StartTime?.substring(0, 5);
    const end = job.SlotTimes[job.SlotTimes.length - 1].EndTime?.substring(0, 5);
    return `${formatTime12(start)} – ${formatTime12(end)}`;
  }
  if (job?.SlotIds && job.SlotIds.length > 0) {
    const times = job.SlotIds
      .map((id) => SLOT_TIME_MAP[id])
      .filter(Boolean)
      .sort((a, b) => a.start.localeCompare(b.start));
    if (times.length > 0) {
      return `${formatTime12(times[0].start)} – ${formatTime12(times[times.length - 1].end)}`;
    }
  }
  return '02:00 PM – 06:00 PM';
};

const DEFAULT_JOB = {
  Job_ID: 101,
  ParentName: 'Sadia Tariq',
  ParentRating: 4.5,
  ParentAddress: 'G-11/4, Islamabad',
  ParentPic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  ChildName: 'Hamza Ahmed',
  ChildAge: 4,
  Gender: 'Boy',
  JobDate: '2026-10-24',
  City: 'G-11/4, Islamabad',
  Payment: 1800,
  SpecialInstructions: 'Hamza has a mild peanut allergy. Please ensure he has his evening snack by 6:00 PM and bedtime story by 8:30 PM.',
};

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();

  const passedJob = location.state?.job;
  const [job, setJob] = useState(() => passedJob || (!jobId ? DEFAULT_JOB : null));
  const [loading, setLoading] = useState(() => !passedJob && Boolean(jobId));

  useEffect(() => {
    if (passedJob || !jobId) return;

    let isMounted = true;
    (async () => {
      try {
        const data = await API.getJobDetails(parseInt(jobId, 10));
        if (isMounted) setJob(data);
      } catch (err) {
        console.error('Failed to load job details from API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [jobId, passedJob]);

  const handleConfirm = async () => {
    const sitterId = Number(localStorage.getItem('userId')) || 1;
    const effectiveJobId = job?.Job_ID || parseInt(jobId, 10) || 101;
    try {
      if (API.confirmJob && effectiveJobId) {
        await API.confirmJob(effectiveJobId, sitterId);
      }
    } catch (e) {
      console.warn('API confirm failed, proceeding with client navigation', e);
    }
    navigate('/upcoming-job-details', {
      state: {
        job: {
          ...job,
          Job_ID: effectiveJobId,
          Status: 'Waiting for Parent',
        },
      },
    });
  };

  const handleReject = async () => {
    const effectiveJobId = job?.Job_ID || parseInt(jobId, 10);
    try {
      if (API.rejectJob && effectiveJobId) {
        await API.rejectJob(effectiveJobId);
      }
    } catch (e) {
      console.warn('API reject failed, proceeding with client navigation', e);
    }
    navigate('/job-request');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <BackButton />
          <h1 className={styles.pageTitle}>Job Details</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
          Loading job details...
        </div>
        <BabysitterBottomNav />
      </div>
    );
  }

  const parentName = job?.ParentName || 'Sadia Tariq';
  const rating = Number(job?.ParentRating ?? job?.Rating ?? 4.5).toFixed(1);
  const locationText = job?.City || job?.ParentAddress || 'G-11/4, Islamabad';
  const childName = job?.ChildName || 'Hamza Ahmed';
  const childAge = job?.ChildAge ?? 4;
  const childGender = job?.Gender || 'Boy';
  const formattedDate = job?.JobDate
    ? new Date(job.JobDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '24 Oct 2026';
  const timeRange = getTimeRange(job);
  const paymentRate = job?.Payment ?? 1800;
  const specialNotes = job?.SpecialInstructions ||
    'Hamza has a mild peanut allergy. Please ensure he has his evening snack by 6:00 PM and bedtime story by 8:30 PM.';

  return (
    <div className={styles.container}>
      {/* Universal Top Header */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Job Details</h1>
      </div>

      {/* Parent Information Card */}
      <div className={styles.parentCard}>
        <img
          src={buildImageUrl(job?.ParentPic)}
          alt={parentName}
          className={styles.parentAvatar}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
          }}
        />
        <div className={styles.parentInfo}>
          <div className={styles.parentNameRow}>
            <h2 className={styles.parentName}>{parentName}</h2>
            <div className={styles.ratingBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{rating} Rating</span>
            </div>
          </div>
          <span className={styles.parentSubtitle}>Member since 2022</span>
          <span className={styles.parentLocation}>📍 {locationText}</span>
        </div>
      </div>

      {/* Child Information Section */}
      <h3 className={styles.sectionTitle}>Child Information</h3>
      <div className={styles.childCard}>
        <div className={styles.childAvatar}>
          👶
        </div>
        <div className={styles.childInfo}>
          <h4 className={styles.childName}>{childName}</h4>
          <span className={styles.childMetaText}>Age: {childAge} Years Old</span>
          <span className={styles.childMetaText}>Gender: {childGender}</span>
        </div>
      </div>

      {/* Job Specifics 4-Bento Grid */}
      <h3 className={styles.sectionTitle}>Job Specifics</h3>
      <div className={styles.bentoGrid}>
        {/* Date Bento */}
        <div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>DATE</span>
          </div>
          <span className={styles.bentoValue}>{formattedDate}</span>
        </div>

        {/* Time Bento */}
        <div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>TIME</span>
          </div>
          <span className={styles.bentoValue}>{timeRange}</span>
        </div>

        {/* Location Bento */}
        <div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>LOCATION</span>
          </div>
          <span className={styles.bentoValue}>{locationText}</span>
        </div>

        {/* Payment Bento */}
        <div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            <span>PAYMENT</span>
          </div>
          <span className={styles.bentoValue}>{paymentRate} PKR/hr</span>
        </div>
      </div>

      {/* Special Instructions */}
      <h3 className={styles.sectionTitle}>Special Instructions</h3>
      <div className={styles.instructionsCard}>
        <div className={styles.instructionsHeader}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8622A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>SPECIAL INSTRUCTIONS</span>
        </div>
        <p className={styles.instructionsText}>{specialNotes}</p>
      </div>

      {/* Bottom Action Buttons (Reject & Confirm) */}
      <div className={styles.actionRow}>
        <button type="button" onClick={handleReject} className={styles.rejectBtn}>
          Reject
        </button>
        <button type="button" onClick={handleConfirm} className={styles.confirmBtn}>
          Confirm
        </button>
      </div>

      <BabysitterBottomNav />
    </div>
  );
};

export default JobDetails;
