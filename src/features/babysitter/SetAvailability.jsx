import React, { useState, useEffect, useCallback } from 'react';
import BabysitterBottomNav from '../../components/layout/BabysitterBottomNav';
import BackButton from '../../components/ui/BackButton';
import GoogleMapRadiusPicker from '../../components/ui/GoogleMapRadiusPicker';
import { API } from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import styles from './set-availability.module.css';

// ---------------------------------------------------------------------------
// Set Availability — Frame 18_2 Strict Replication
// Features: Perfect 7-column CSS grid for weekdays (S M T W T F S) and month dates,
// solid orange active date circles (#E8622A), custom dual time pill cards
// (START TIME / END TIME), interactive area selector with tag pills, and
// full-width vibrant orange "Save Availability" button.
// ---------------------------------------------------------------------------

const TIME_OPTIONS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
];

const SLOT_HOURS = [
  { id: 1, start: 8, end: 10 },
  { id: 2, start: 10, end: 12 },
  { id: 3, start: 12, end: 14 },
  { id: 4, start: 14, end: 16 },
  { id: 5, start: 16, end: 18 },
  { id: 6, start: 18, end: 20 },
  { id: 7, start: 20, end: 22 },
  { id: 8, start: 22, end: 24 },
];

const timeToHour = (label) => {
  const period = label.slice(-2);
  const base = Number(label.slice(0, 2)) % 12;
  return period === 'PM' ? base + 12 : base;
};

const slotsForRange = (startLabel, endLabel) => {
  const start = timeToHour(startLabel);
  const end = timeToHour(endLabel);
  return SLOT_HOURS.filter((s) => s.end > start && s.start < end).map((s) => s.id);
};

// Single-letter weekday headers matching Frame 18_2 mockup: S M T W T F S
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMonthMatrix = (year, month) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const offset = first.getDay(); // 0 = Sunday
  const daysInMonth = last.getDate();
  const weeks = [];
  let currentWeek = new Array(7).fill(null);

  for (let i = 0; i < offset; i += 1) {
    currentWeek[i] = null;
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const dayOfWeek = (offset + d - 1) % 7;
    const dateObj = new Date(year, month, d);
    currentWeek[dayOfWeek] = {
      date: dateObj,
      dateStr: formatLocalDate(dateObj),
      dayNum: d,
    };
    if (dayOfWeek === 6 || d === daysInMonth) {
      weeks.push(currentWeek);
      currentWeek = new Array(7).fill(null);
    }
  }
  return weeks;
};

export default function SetAvailability() {
  const { userId } = useAuth();
  const toast = useToast();

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Default selected dates (6, 7, 12, 21 as shown in mockup Frame 18_2)
  const [selectedDates, setSelectedDates] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('availabilitySelections') || 'null');
      if (saved && Object.keys(saved).length > 0) {
        return Object.keys(saved);
      }
    } catch {
      /* ignore */
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return [
      `${y}-${m}-06`,
      `${y}-${m}-07`,
      `${y}-${m}-12`,
      `${y}-${m}-21`,
    ];
  });

  const [startTime, setStartTime] = useState(() => localStorage.getItem('availStart') || '09:00 AM');
  const [endTime, setEndTime] = useState(() => localStorage.getItem('availEnd') || '05:00 PM');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Preferred areas matching Frame 18_2
  const [selectedAreas, setSelectedAreas] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('preferredAreas') || 'null');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {
      /* ignore */
    }
    return ['DHA Phase 6, Lahore', 'Gulberg III'];
  });

  // Smart Geocoded Area state (auto-updated from Google Map pin)
  const [preferredAreaText, setPreferredAreaText] = useState(() => {
    try {
      const saved = localStorage.getItem('preferredAreaText');
      if (saved) return saved;
      const savedAreas = JSON.parse(localStorage.getItem('preferredAreas') || 'null');
      if (Array.isArray(savedAreas) && savedAreas.length > 0) return savedAreas[0];
    } catch {
      /* ignore */
    }
    return 'DHA Phase 6, Lahore';
  });

  const [userLocation, setUserLocation] = useState(null);
  const [saving, setSaving] = useState(false);

  // Safe Geolocation handler: Silent catch prevents [object GeolocationPositionError] console spam
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator?.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          () => {
            // Silently swallow error to prevent console spam
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      } catch {
        // Silently catch
      }
    }
  }, []);

  const weeks = getMonthMatrix(monthCursor.getFullYear(), monthCursor.getMonth());
  const selectedSet = new Set(selectedDates);
  const todayStr = formatLocalDate(new Date());
  const monthTitle = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const map = {};
    const slots = slotsForRange(startTime, endTime);
    selectedDates.forEach((date) => {
      map[date] = slots;
    });
    localStorage.setItem('availabilitySelections', JSON.stringify(map));
    localStorage.setItem('availability', JSON.stringify(map));
    localStorage.setItem('availStart', startTime);
    localStorage.setItem('availEnd', endTime);
    localStorage.setItem('preferredAreas', JSON.stringify(selectedAreas));
    localStorage.setItem('preferredAreaText', preferredAreaText);
  }, [selectedDates, startTime, endTime, selectedAreas, preferredAreaText]);

  const shiftMonth = (dir) => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };

  const toggleDate = (dateStr) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleAreaDetected = useCallback((area) => {
    if (area) {
      setPreferredAreaText(area);
      localStorage.setItem('preferredAreaText', area);
      setSelectedAreas([area]);
    }
  }, []);

  const handleSave = async () => {
    if (selectedDates.length === 0) {
      toast.warning('Please select at least one available date.');
      return;
    }
    if (!userId) {
      toast.info('Availability preferences updated locally.');
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;
    const activeSlotIds = slotsForRange(startTime, endTime);
    const primaryCity = preferredAreaText || selectedAreas[0] || 'Lahore';

    for (const date of selectedDates) {
      try {
        await API.saveAvailability({
          BabySitter_ID: userId,
          Date: date,
          SlotIds: activeSlotIds,
          city: primaryCity,
        });
        successCount += 1;
      } catch {
        errorCount += 1;
      }
    }

    setSaving(false);

    if (errorCount === 0 && successCount > 0) {
      toast.success(`Saved availability for ${successCount} date(s)!`);
    } else if (errorCount > 0) {
      toast.info(`Saved ${successCount} date(s); ${errorCount} had errors.`);
    } else {
      toast.success('Availability preferences saved successfully!');
    }
  };

  return (
    <div className={styles.availContainer}>
      {/* Top Header with BackButton, title, subtitle (Frame 18_2) */}
      <header className={styles.topBar}>
        <BackButton />
        <div className={styles.headerCenter}>
          <h1 className={styles.pageTitle}>Set Availability</h1>
        </div>
        <div className={styles.topBarSpacer} aria-hidden="true" />
      </header>

      <p className={styles.subtitle}>
        Select one or multiple dates you are available to work.
      </p>

      {/* Calendar Card (Frame 18_2) */}
      <section className={styles.calendarCard} aria-label="Work Calendar">
        {/* Month Navigation */}
        <div className={styles.calendarHeader}>
          <button
            type="button"
            className={styles.navIcon}
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.calendarTitle}>{monthTitle}</span>
          <button
            type="button"
            className={styles.navIcon}
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* 7-Column CSS Grid for Weekday Letters: S M T W T F S */}
        <div className={styles.weekdaysGrid}>
          {WEEKDAY_INITIALS.map((letter, idx) => (
            <div key={`${letter}-${idx}`} className={styles.weekdayLabel}>
              {letter}
            </div>
          ))}
        </div>

        {/* 7-Column CSS Grid for Dates */}
        <div className={styles.calendarGrid}>
          {weeks.map((week, wIdx) => (
            <React.Fragment key={`week-${wIdx}`}>
              {week.map((day, dIdx) => {
                if (!day) {
                  return <div key={`empty-${wIdx}-${dIdx}`} className={styles.dayEmpty} />;
                }
                const isSelected = selectedSet.has(day.dateStr);
                const isToday = day.dateStr === todayStr;
                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    className={`${styles.dayBtn} ${isSelected ? styles.daySelected : ''} ${isToday && !isSelected ? styles.dayToday : ''}`}
                    onClick={() => toggleDate(day.dateStr)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${day.dateStr}`}
                  >
                    {day.dayNum}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Available Time Section (Frame 18_2) */}
      <section aria-label="Available Time">
        <h2 className={styles.sectionTitle} style={{ marginBottom: 12 }}>
          Available Time
        </h2>
        <div className={styles.timeGrid}>
          {/* Start Time Pill Card */}
          <div
            className={styles.timeCardPill}
            onClick={() => {
              setShowStartPicker((prev) => !prev);
              setShowEndPicker(false);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowStartPicker((prev) => !prev)}
          >
            <div className={styles.timeHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={styles.timeLabel}>START TIME</span>
            </div>
            <p className={styles.timeValue}>{startTime}</p>

            {showStartPicker && (
              <div className={styles.timeDropdown} onClick={(e) => e.stopPropagation()}>
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={styles.timeOption}
                    onClick={() => {
                      setStartTime(opt);
                      setShowStartPicker(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* End Time Pill Card */}
          <div
            className={styles.timeCardPill}
            onClick={() => {
              setShowEndPicker((prev) => !prev);
              setShowStartPicker(false);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowEndPicker((prev) => !prev)}
          >
            <div className={styles.timeHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={styles.timeLabel}>END TIME</span>
            </div>
            <p className={styles.timeValue}>{endTime}</p>

            {showEndPicker && (
              <div className={styles.timeDropdown} onClick={(e) => e.stopPropagation()}>
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={styles.timeOption}
                    onClick={() => {
                      setEndTime(opt);
                      setShowEndPicker(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Preferred Work Area Section (Frame 18_2) */}
      <section className={styles.areaSection} aria-label="Preferred Work Area">
        <h2 className={styles.sectionTitle}>Preferred Work Area</h2>

        {/* Sleek Neumorphic Smart Textbox (Fix 4: Replaces HTML dropdown) */}
        <div className={styles.smartAreaWrapper}>
          <span className={styles.smartAreaPin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <input
            type="text"
            readOnly
            value={preferredAreaText}
            placeholder="Move map pin to detect area"
            className={styles.smartAreaInput}
            aria-label="Selected Work Area"
          />
          <span className={styles.smartAreaBadge}>
            Live Pin
          </span>
        </div>

        {/* Authentic Live Google Map with Draggable Pin & 3km Radius Circle */}
        <div style={{ marginTop: '8px' }}>
          <GoogleMapRadiusPicker
            initialCenter={userLocation || { lat: 31.5204, lng: 74.3587 }}
            onLocationChange={(coords) => {
              localStorage.setItem('workAreaCoords', JSON.stringify(coords));
            }}
            onAreaDetected={handleAreaDetected}
          />
        </div>
      </section>

      {/* Save Availability Button (Frame 18_2) */}
      <button
        type="button"
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Availability'}
      </button>

      <BabysitterBottomNav />
    </div>
  );
}
