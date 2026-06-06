import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';
import { API } from '../Services/api';

const orange = '#E8622A';

/* ── SVG Icons ──────────────────────────── */
const Icons = {
  arrowBack: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  saveOutline: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  checkmarkCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const TIME_SLOTS = [
  { id: 1, label: '8–10 AM'     },
  { id: 2, label: '10 AM–12 PM' },
  { id: 3, label: '12–2 PM'     },
  { id: 4, label: '2–4 PM'      },
  { id: 5, label: '4–6 PM'      },
  { id: 6, label: '6–8 PM'      },
  { id: 7, label: '8–10 PM'     },
  { id: 8, label: '10 PM–12 AM' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getWeekDates = (offset) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = today.getDay();
  const toMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + toMon + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return formatLocalDate(d);
  });
};

const fmt = (iso) => iso.slice(5);

const SetAvailability = () => {
  const navigate = useNavigate();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  const [selections, setSelections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('availabilitySelections') || '{}'); }
    catch { return {}; }
  });

  const [city, setCity] = useState(localStorage.getItem('city') || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLog, setSaveLog] = useState('');

  useEffect(() => {
    localStorage.setItem('availabilitySelections', JSON.stringify(selections));
    localStorage.setItem('availability', JSON.stringify(selections));
  }, [selections]);

  const toggleSlot = (date, slotId) => {
    setSelections(prev => {
      const current = prev[date] || [];
      const updated = current.includes(slotId)
        ? current.filter(s => s !== slotId)
        : [...current, slotId];
      return { ...prev, [date]: updated };
    });
  };

  const isSelected = (date, slotId) =>
    (selections[date] || []).includes(slotId);

  const selectAll = () => {
    setSelections(prev => {
      const next = { ...prev };
      weekDates.forEach(date => { next[date] = TIME_SLOTS.map(s => s.id); });
      return next;
    });
  };

  const clearWeek = () => {
    setSelections(prev => {
      const next = { ...prev };
      weekDates.forEach(date => { next[date] = []; });
      return next;
    });
  };

  const clearAllAvailability = async () => {
    if (!window.confirm('Delete ALL your saved availability? This cannot be undone.')) return;

    const sitterId = Number(localStorage.getItem('userId'));
    setSaving(true);
    try {
      await API.clearAllAvailability(sitterId);
      localStorage.removeItem('availability');
      localStorage.removeItem('availabilitySelections');
      setSelections({});
      setSaveLog('✓ All availability cleared');
      setTimeout(() => setSaveLog(''), 3000);
    } catch (err) {
      localStorage.removeItem('availability');
      localStorage.removeItem('availabilitySelections');
      setSelections({});
      setSaveLog('⚠ Cleared locally (server error)');
      setTimeout(() => setSaveLog(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!city.trim()) { alert('Please enter your city first.'); return; }

    setSaving(true);
    setSaveLog('');

    const sitterId = Number(localStorage.getItem('userId'));
    const trimmedCity = city.trim();

    localStorage.setItem('city', trimmedCity);
    localStorage.setItem('availability', JSON.stringify(selections));
    localStorage.setItem('availabilitySelections', JSON.stringify(selections));

    const entries = Object.entries(selections).filter(([, slots]) => slots.length > 0);
    let successCount = 0;
    let errorCount = 0;

    for (const [date, slotIds] of entries) {
      try {
        await API.saveAvailability({ sitterId, date, slotIds, city: trimmedCity });
        successCount++;
        console.log(`✅ Saved ${date}: slots [${slotIds}] city=${trimmedCity}`);
      } catch (err) {
        errorCount++;
        console.error(`❌ ${date}:`, err);
      }
    }

    setSaving(false);

    if (errorCount === 0 && successCount > 0) {
      setSaved(true);
      setSaveLog(`✓ Saved ${successCount} date(s) to server`);
      setTimeout(() => { setSaved(false); setSaveLog(''); }, 4000);
    } else if (successCount === 0 && entries.length > 0) {
      setSaveLog(`⚠ Server unreachable. ${entries.length} date(s) saved locally only.`);
      setSaved(true);
      setTimeout(() => { setSaved(false); setSaveLog(''); }, 5000);
    } else if (entries.length === 0) {
      setSaveLog('No slots selected to save.');
      setTimeout(() => setSaveLog(''), 3000);
    } else {
      setSaveLog(`Partial: ${successCount} saved, ${errorCount} failed.`);
      setTimeout(() => setSaveLog(''), 4000);
    }
  };

  const visibleCount = weekDates.reduce(
    (acc, d) => acc + (selections[d]?.length || 0), 0
  );

  const totalCount = Object.values(selections).flat().length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#f5c6d6 0%,#c8dae8 100%)', paddingBottom: 100 }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 10px' }}>
          <div onClick={() => navigate(-1)} style={iconBtn}>
            <Icons.arrowBack />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>Set Availability</h2>
            <p style={{ margin: 0, fontSize: 10, color: '#888' }}>{weekDates[0]} → {weekDates[6]}</p>
          </div>
          <div onClick={save} style={{ ...iconBtn, border: `1.5px solid ${orange}`, position: 'relative' }}>
            {saved ? <Icons.checkmarkCircle /> : <Icons.saveOutline />}
            {visibleCount > 0 && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                width: 16, height: 16, borderRadius: '50%',
                background: orange, color: '#fff', fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{visibleCount}</div>
            )}
          </div>
        </div>

        {saveLog ? (
          <div style={{
            margin: '0 20px 10px', padding: '8px 14px', borderRadius: 10,
            background: saveLog.startsWith('✓') ? '#e6f9f0' : saveLog.startsWith('⚠') ? '#fff8e1' : '#fff5ef',
            fontSize: 12,
            color: saveLog.startsWith('✓') ? '#27ae60' : saveLog.startsWith('⚠') ? '#f39c12' : '#e74c3c',
            fontWeight: 600, textAlign: 'center',
          }}>
            {saveLog}
          </div>
        ) : (
          <p style={{ textAlign: 'center', margin: '0 0 10px', color: '#666', fontSize: 13 }}>
            Navigate weeks · tap slots · press Save
          </p>
        )}

        {/* Week Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 20px', marginBottom: 12 }}>
          <button
            onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            style={{
              padding: '8px 16px', borderRadius: 20,
              background: weekOffset === 0 ? '#eee' : orange,
              color: weekOffset === 0 ? '#aaa' : '#fff',
              border: 'none', fontWeight: 700, fontSize: 13,
              cursor: weekOffset === 0 ? 'default' : 'pointer',
            }}
          >← Prev</button>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#555', textAlign: 'center', lineHeight: 1.5 }}>
            Week {weekOffset + 1}<br />
            <span style={{ fontSize: 10, color: '#aaa' }}>{fmt(weekDates[0])} – {fmt(weekDates[6])}</span>
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            style={{
              padding: '8px 16px', borderRadius: 20,
              background: orange, color: '#fff',
              border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >Next →</button>
        </div>

        {/* City Input */}
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Your city (must match job city exactly, e.g. Islamabad)"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12,
              border: '1.5px solid #ddd', fontSize: 13, outline: 'none',
              background: '#fff', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px', marginBottom: 14 }}>
          <button onClick={selectAll} style={btnPrimary}>Select All</button>
          <button onClick={clearWeek} style={btnOutline}>Clear Week</button>
          <button
            onClick={clearAllAvailability}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 30,
              background: '#fff', color: '#e74c3c',
              border: '1.5px solid #e74c3c',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >Clear ALL</button>
        </div>

        {/* Availability Grid */}
        <div style={{ overflowX: 'auto', padding: '0 8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 360 }}>
            <thead>
              <tr>
                <th style={{ width: 80, fontSize: 10, color: '#aaa', textAlign: 'left', paddingLeft: 8 }}>Time</th>
                {DAY_LABELS.map((d, i) => {
                  const hasSlots = (selections[weekDates[i]] || []).length > 0;
                  return (
                    <th key={d} style={{ textAlign: 'center', paddingBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: hasSlots ? orange : '#444' }}>{d}</div>
                      <div style={{ fontSize: 9, color: '#bbb' }}>{fmt(weekDates[i])}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => (
                <tr key={slot.id}>
                  <td style={{ padding: '5px 4px 5px 8px', fontSize: 10, color: '#666', verticalAlign: 'middle' }}>
                    {slot.label}
                  </td>
                  {DAY_LABELS.map((_, di) => {
                    const date = weekDates[di];
                    const on = isSelected(date, slot.id);
                    return (
                      <td key={di} style={{ textAlign: 'center', padding: '4px 2px', verticalAlign: 'middle' }}>
                        <div
                          onClick={() => toggleSlot(date, slot.id)}
                          style={{
                            width: 28, height: 28, margin: '0 auto', borderRadius: 7,
                            background: on ? orange : 'rgba(255,255,255,0.8)',
                            border: on ? 'none' : '1.5px solid #ccc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: on ? '0 2px 8px rgba(232,98,42,0.4)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {on && (
                            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                              <path d="M1 5L4.5 9L12 1" stroke="#fff" strokeWidth="2.2"
                                strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px 0' }}>
          <div style={{ width: 13, height: 13, borderRadius: 3, background: orange }} />
          <span style={{ fontSize: 11, color: '#888' }}>Available</span>
          <div style={{ width: 13, height: 13, borderRadius: 3, background: '#fff', border: '1.5px solid #ccc', marginLeft: 12 }} />
          <span style={{ fontSize: 11, color: '#888' }}>Not available</span>
        </div>
        <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 11, color: '#aaa' }}>
          {totalCount} total slots selected across all weeks
        </p>
      </div>

      {/* Save Button fixed – bottom adjusted for new nav height */}
      <div style={{ position: 'fixed', bottom: 70, left: 0, right: 0, zIndex: 150 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: '100%', padding: 17,
            background: saving ? '#ccc' : orange,
            color: '#fff', border: 'none',
            fontWeight: 700, fontSize: 16,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Availability'}
        </button>
      </div>

      {/* Shared bottom navigation */}
      <BabysitterBottomNav />
    </div>
  );
};

const iconBtn = {
  width: 38, height: 38, borderRadius: 10,
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};
const btnPrimary = {
  flex: 1, padding: '12px 0', borderRadius: 30,
  background: orange, color: '#fff', border: 'none',
  fontWeight: 700, fontSize: 13, cursor: 'pointer',
};
const btnOutline = {
  flex: 1, padding: '12px 0', borderRadius: 30,
  background: '#fff', color: orange, border: `1.5px solid ${orange}`,
  fontWeight: 700, fontSize: 13, cursor: 'pointer',
};

export default SetAvailability;