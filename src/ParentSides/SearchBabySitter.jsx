import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../components/ParentBottomNav';
console.log("BabySitterDetails NEW VERSION LOADED");
const orange = '#C8521A';
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ---------- Helper: Convert image path to API URL ----------
const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/150?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  // Fallback for old images without folder prefix (e.g., just "ali.jpg")
  return `/api/images/default/${pic}`;
};

// ---------- Time helpers ----------
const timeTo24h = (time12) => {
  const [time, modifier] = time12.split(' ');
  let [hours, minutes] = time.split(':');
  if (modifier === 'PM' && hours !== '12') hours = String(Number(hours) + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}`;
};

const timeTo12h = (time24) => {
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${suffix}`;
};

// ---------- SVG Icons ----------
const Icons = {
  locationOutline: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  star: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#F5A623" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  starOutline: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  calendarOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  timeOutline: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  arrowBackOutline: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
};

const SearchBabySitter = () => {
  const navigate = useNavigate();

  // ---------- Load logged‑in parent data (for header avatar) ----------
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setUserData(JSON.parse(userStr));
    } catch (e) {
      console.error('Failed to parse user data', e);
    }
  }, []);

  const parentPic = userData?.pictureAddress || userData?.PictureAddress || null;
  const parentAvatar = buildImageUrl(parentPic) || 'https://i.pravatar.cc/40?img=32';

  // ---------- Filter states ----------
  const [city, setCity] = useState('Islamabad');
  const [rating, setRating] = useState(0);
  const [selectedExp, setSelectedExp] = useState('0–1 years');
  const [availabilityType, setAvailabilityType] = useState('One Day');
  const [startDate, setStartDate] = useState('2026-04-13');
  const [endDate, setEndDate] = useState('2026-04-13');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState(['Monday']);

  // ---------- UI state ----------
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync end date & days when One Day selected
  useEffect(() => {
    if (availabilityType === 'One Day') {
      setEndDate(startDate);
      const date = new Date(startDate);
      const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
      setSelectedDays([dayName]);
    }
  }, [availabilityType, startDate]);

  const getMinExperienceYears = () => {
    switch (selectedExp) {
      case '0–1 years': return 0;
      case '1–3 years': return 1;
      case '3+ years': return 3;
      default: return 0;
    }
  };

  const toggleFavorite = (id) => {
    setSitters(prev => prev.map(s => s.Sitter_ID === id ? { ...s, favorited: !s.favorited } : s));
  };

  const fetchSitters = async () => {
    setLoading(true);
    setError(null);
    const payload = {
      city: city.trim(),
      minRating: rating,
      minExperienceYears: getMinExperienceYears(),
      startDate,
      endDate: availabilityType === 'One Day' ? startDate : endDate,
      startTime,
      endTime,
      selectedDays,
      availabilityType,
    };
    try {
      const response = await fetch('/api/matching/search-sitters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setSitters(data.map(s => ({ ...s, favorited: false })));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setSitters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSitters(); }, []);

  const goToSitterDetails = (sitter) => {
  navigate('/babysitter-details', {
    state: {
      sitter,
      searchFilters: {
        city,
        startDate,
        endDate,
        startTime,
        endTime,
        selectedDays,
        availabilityType
      }
    }
  });
};

  const handleReset = () => {
    setCity('Islamabad');
    setRating(0);
    setSelectedExp('0–1 years');
    setAvailabilityType('One Day');
    setStartDate('2026-04-13');
    setEndDate('2026-04-13');
    setStartTime('08:00');
    setEndTime('17:00');
    setSelectedDays(['Monday']);
  };

  const chipStyle = (active) => ({
    padding: '9px 18px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: 500,
    background: active ? orange : '#EDEDED',
    color: active ? '#fff' : '#555',
    border: 'none',
    marginRight: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #f9cfe0 0%, #e8d6f0 40%, #ccd8f5 100%)', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 10px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icons.arrowBackOutline />
        </div>
        <span style={{ fontWeight: 700, fontSize: '17px', color: orange, fontFamily: 'Georgia, serif' }}>Find a Sitter</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="13" y1="18" x2="21" y2="18" />
              <circle cx="5.5" cy="12" r="2" fill={orange} stroke="none" /><circle cx="10.5" cy="18" r="2" fill={orange} stroke="none" />
            </svg>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${orange}` }}>
            <img src={parentAvatar} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://i.pravatar.cc/40?img=32'; }} />
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div style={{ background: '#fff', borderRadius: '28px', padding: '22px 20px', margin: '4px 16px', boxShadow: '0 6px 24px rgba(0,0,0,0.07)' }}>
        {/* City */}
        <p style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px' }}>CITY</p>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F5F5F5', borderRadius: '14px', padding: '13px 14px', marginBottom: '18px' }}>
          <Icons.locationOutline />
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" style={{ border: 'none', background: 'transparent', marginLeft: '10px', width: '100%', outline: 'none', fontSize: '14px', color: '#333' }} />
        </div>

        {/* Experience */}
        <p style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px' }}>EXPERIENCE</p>
        <div style={{ marginBottom: '18px' }}>
          {['0–1 years', '1–3 years', '3+ years'].map(e => (
            <button key={e} style={chipStyle(selectedExp === e)} onClick={() => setSelectedExp(e)}>{e}</button>
          ))}
        </div>

        {/* Availability Type */}
        <p style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px' }}>AVAILABILITY TYPE</p>
        <div style={{ display: 'flex', background: '#F0F0F0', borderRadius: '30px', padding: '4px', marginBottom: '18px' }}>
          {['One Day', 'Repeat Days'].map(type => (
            <button key={type} onClick={() => setAvailabilityType(type)} style={{
              flex: 1, padding: '10px', borderRadius: '26px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              background: availabilityType === type ? orange : 'transparent', color: availabilityType === type ? '#fff' : '#777',
              boxShadow: availabilityType === type ? '0 3px 10px rgba(200,82,26,0.3)' : 'none',
            }}>{type}</button>
          ))}
        </div>

        {/* Date Row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: '#4a90d9', fontWeight: 700, marginBottom: '6px' }}>START DATE</p>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E0E0E0', borderRadius: '12px', padding: '10px 12px', background: '#fff' }}>
              <Icons.calendarOutline />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#333', width: '100%', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: '#4a90d9', fontWeight: 700, marginBottom: '6px' }}>END DATE</p>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E0E0E0', borderRadius: '12px', padding: '10px 12px', background: availabilityType === 'One Day' ? '#F5F5F5' : '#fff', opacity: availabilityType === 'One Day' ? 0.7 : 1 }}>
              <Icons.calendarOutline />
              <input type="date" value={availabilityType === 'One Day' ? startDate : endDate} onChange={e => setEndDate(e.target.value)} disabled={availabilityType === 'One Day'} style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#333', width: '100%', fontFamily: 'inherit', background: 'transparent' }} />
            </div>
          </div>
        </div>

        {/* Time Row – simplified with input type="time" */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: '#4a90d9', fontWeight: 700, marginBottom: '6px' }}>START TIME</p>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E0E0E0', borderRadius: '12px', padding: '10px 12px', background: '#fff' }}>
              <Icons.timeOutline />
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#333', width: '100%', fontFamily: 'inherit', marginLeft: '8px' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: '#4a90d9', fontWeight: 700, marginBottom: '6px' }}>END TIME</p>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E0E0E0', borderRadius: '12px', padding: '10px 12px', background: '#fff' }}>
              <Icons.timeOutline />
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#333', width: '100%', fontFamily: 'inherit', marginLeft: '8px' }} />
            </div>
          </div>
        </div>

        {/* Days Selection – only for Repeat Days */}
        {availabilityType === 'Repeat Days' && (
          <>
            <p style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 600, marginBottom: '10px' }}>SELECT DAYS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: '18px' }}>
              {daysOfWeek.map(day => {
                const checked = selectedDays.includes(day);
                return (
                  <div key={day} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: checked ? orange : 'transparent', border: checked ? 'none' : '1.5px solid #CCC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {checked && <span style={{ color: '#fff', fontSize: '13px' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '14px', color: '#333' }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Rating */}
        <p style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px' }}>MINIMUM RATING</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '22px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} onClick={() => setRating(i)} style={{ cursor: 'pointer' }}>
              {i <= rating ? <Icons.star /> : <Icons.starOutline />}
            </span>
          ))}
          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#555', fontWeight: 500 }}>{rating}.0 & Up</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleReset} style={{ flex: 1, padding: '15px', borderRadius: '30px', background: 'transparent', border: 'none', fontWeight: 700, fontSize: '15px', color: orange, cursor: 'pointer' }}>Reset</button>
          <button onClick={fetchSitters} style={{ flex: 2.5, padding: '15px', borderRadius: '30px', background: orange, color: '#fff', border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(200,82,26,0.35)' }}>Save Filters</button>
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: '24px 16px 0' }}>
        <h2 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '22px', color: '#1a1a1a' }}>Available Sitters</h2>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: orange, fontWeight: 500 }}>{loading ? 'Searching...' : `${sitters.length} matches found`}</p>

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading...</p></div>}
        {error && <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>{error}</div>}
        {!loading && !error && sitters.length === 0 && <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>No sitters match your filters. Try adjusting the criteria.</div>}

        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sitters.map(s => (
            <div key={s.Sitter_ID} onClick={() => goToSitterDetails(s)} style={{ background: '#fff', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 3px 14px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <img src={buildImageUrl(s.PictureAddress)} alt={s.FullName} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 3px', fontWeight: 800, fontSize: '16px' }}>{s.FullName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Icons.star style={{ width: '13px', height: '13px' }} />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{s.Rating.toFixed(1)}</span>
                </div>
                <span style={{ fontSize: '11px', background: '#F5F5F5', borderRadius: '8px', padding: '3px 10px', color: '#666', fontWeight: 500 }}>{s.ExperienceYears} yrs exp</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div onClick={(e) => { e.stopPropagation(); toggleFavorite(s.Sitter_ID); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '16px', color: s.favorited ? '#e74c3c' : '#ccc' }}>{s.favorited ? '♥' : '♡'}</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: '15px', color: orange }}>{s.HourlyRate} PKR<span style={{ fontSize: '11px', fontWeight: 500, color: '#aaa' }}>/hr</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ParentBottomNav />
    </div>
  );
};

export default SearchBabySitter;