import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';

const orange = '#E8622A';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `https://localhost:44368/api/images/${type}/${filename}`;
  }
  return `https://localhost:44368/api/images/default/${pic}`;
};

const Icons = {
  locationOutline: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  star: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFB400" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  callOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  mailOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
};

const BabySitterDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedSitter = location.state?.sitter;
  const searchFilters = location.state?.searchFilters || {};

  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showChildPopup, setShowChildPopup] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [fetchingChildren, setFetchingChildren] = useState(false);

  const parentId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchSitter = async () => {
      if (!passedSitter?.Sitter_ID) {
        setError('No sitter selected.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://localhost:44368/api/matching/babysitter/${passedSitter.Sitter_ID}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSitter({ ...data, City: passedSitter.City || data.City });
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load sitter details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSitter();
  }, [passedSitter]);

  const fetchChildren = async () => {
    setFetchingChildren(true);
    try {
      const res = await fetch(`https://localhost:44368/api/parent/children/${parentId}`);
      if (!res.ok) throw new Error('Cannot load children');
      const data = await res.json();
      return data;
    } catch {
      return [];
    } finally {
      setFetchingChildren(false);
    }
  };

  const handleConfirmHire = async () => {
    const childList = await fetchChildren();
    setChildren(childList);

    if (childList.length === 0) {
      alert('You haven’t added any children yet. Please go to “Set Child Profile” to add one.');
      return;
    }
    if (childList.length === 1) {
      createJob(childList[0].Child_ID);
    } else {
      setSelectedChildren([]);
      setShowChildPopup(true);
    }
  };

  const handleContinueWithSelectedChild = () => {
    if (selectedChildren.length === 0) {
      alert('Please select a child.');
      return;
    }
    createJob(selectedChildren[0]);
  };

  const createJob = async (childId) => {
    const filters = searchFilters || {};
    const sitterId = sitter.Sitter_ID;

    const startDate = filters.startDate ? new Date(filters.startDate) : new Date();
    const endDate = filters.endDate ? new Date(filters.endDate) : startDate;
    const selectedDays = filters.selectedDays || [];
    const availabilityType = filters.availabilityType || 'One Day';

    const datesToCreate = [];

    if (availabilityType === 'Repeat Days') {
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        if (selectedDays.includes(dayName)) {
          datesToCreate.push(new Date(d));
        }
      }
    } else {
      datesToCreate.push(new Date(startDate));
    }

    if (datesToCreate.length === 0) {
      alert('No valid dates selected.');
      return;
    }

    setShowChildPopup(false);
    setLoading(true);

    try {
      for (const date of datesToCreate) {
        const payload = {
          ParentId: parentId,
          SitterId: sitterId,
          ChildId: childId,
          City: filters.city || sitter.City || 'Islamabad',
          StartDate: date.toISOString().split('T')[0],
          StartTime: filters.startTime || '08:00',
          EndTime: filters.endTime || '17:00',
        };

        const res = await fetch('https://localhost:44368/api/parent/create-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to create job for ${payload.StartDate}`);
        }
      }

      alert(`Job(s) created successfully! Total: ${datesToCreate.length}`);
      navigate('/job-requested-success');
    } catch (err) {
      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '—';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  if (loading || fetchingChildren) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(180deg, #fce4ec 0%, #e0f2f1 100%)' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>{fetchingChildren ? 'Loading children…' : 'Loading…'}</div>
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(180deg, #fce4ec 0%, #e0f2f1 100%)' }}>
        <p>{error || 'No sitter details available.'}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 24px', borderRadius: '20px', background: orange, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fce4ec 0%, #e0f2f1 100%)', paddingBottom: '100px' }}>
      <div style={{ padding: '24px 20px 140px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
          <div onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
            <Icons.arrowBack />
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#2D3142' }}>Sitter Details</h2>
        </div>

        {/* Profile Summary */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '25px' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 'bold', color: '#111' }}>{sitter.FullName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <Icons.locationOutline />
              <span style={{ fontSize: '13px', color: '#888' }}>{sitter.City || 'Islamabad'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icons.star />
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{sitter.Rating ? sitter.Rating.toFixed(1) : '0.0'}</span>
              <span style={{ fontSize: '13px', color: '#aaa' }}>(reviews)</span>
            </div>
          </div>
          <img src={buildImageUrl(sitter.PictureAddress)} alt={sitter.FullName} style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
        </div>

        {/* Identity Details */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#aaa', fontWeight: 'bold', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Age</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111' }}>{sitter.DOB ? `${calculateAge(sitter.DOB)} yrs` : '—'}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#aaa', fontWeight: 'bold', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Experience</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111' }}>{sitter.ExperienceYears} {sitter.ExperienceYears === 1 ? 'year' : 'years'}</p>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff5ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.callOutline /></div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#aaa', fontWeight: 'bold', letterSpacing: '0.8px' }}>PHONE</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>{sitter.PhoneNumber || '—'}</p>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff5ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.mailOutline /></div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#aaa', fontWeight: 'bold', letterSpacing: '0.8px' }}>EMAIL</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>{sitter.EmailAddress || '—'}</p>
          </div>
        </div>

        {/* Rate */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', marginBottom: '15px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '10px', color: '#aaa', fontWeight: 'bold', letterSpacing: '0.8px', textTransform: 'uppercase' }}>HOURLY RATE</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: orange }}>Rs.{sitter.HourlyRate}/hr</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button onClick={() => navigate(-1)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'transparent', border: '2px solid #ddd', fontWeight: 700, fontSize: '15px', color: '#666', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleConfirmHire} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: orange, color: '#fff', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Confirm Hire</button>
        </div>
      </div>

      {/* Child Selection Popup */}
      {showChildPopup && children.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', width: '85%', maxWidth: '360px', boxShadow: '0 20px 35px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 'bold', color: '#2D3142' }}>Select Child</h3>
            <div style={{ marginBottom: '20px' }}>
              {children.map((child) => (
                <label key={child.Child_ID} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="childSelect"
                    checked={selectedChildren.includes(child.Child_ID)}
                    onChange={() => setSelectedChildren([child.Child_ID])}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '16px', color: '#333' }}>
                    👶 {child.ChildName} ({calculateAge(child.DOB)} yrs)
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowChildPopup(false)} style={{ flex: 1, padding: '12px', borderRadius: '30px', background: '#f0f0f0', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleContinueWithSelectedChild} style={{ flex: 1, padding: '12px', borderRadius: '30px', background: orange, color: '#fff', border: 'none', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      <ParentBottomNav />
    </div>
  );
};

export default BabySitterDetails;