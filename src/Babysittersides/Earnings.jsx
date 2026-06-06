import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BabysitterBottomNav from '../components/BabysitterBottomNav';

const orange = '#E8622A';

const Icons = {
  arrowBack: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  trendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  personOutline: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const Earnings = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const sitterId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch(`api/babysitter/earnings/${sitterId}`);
        if (!res.ok) throw new Error('Failed to load earnings');
        const data = await res.json();
        setBalance(data.totalEarnings);
        setCompletedJobs(data.completedJobs);
        setTotalHours(data.totalHours);
        setPayments(data.recentPayments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (sitterId) fetchEarnings();
    else setLoading(false);
  }, [sitterId]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f5c6d6 0%, #c8d8e8 100%)', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px' }}>
        <div onClick={() => navigate(-1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <Icons.arrowBack />
        </div>
        <h2 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#1a1a1a' }}>Earnings</h2>
        <div style={{ width: '36px' }} />
      </div>

      <div style={{ padding: '0 16px', marginBottom: '18px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px 24px 20px', boxShadow: '0 6px 20px rgba(0,0,0,0.07)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '110px', height: '110px', borderRadius: '50%', background: '#fde8d0', opacity: 0.55 }} />
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#999' }}>Available Balance</p>
          <h1 style={{ margin: '0 0 14px', fontSize: '32px', fontWeight: '800', color: '#1a1a1a' }}>PKR {balance.toFixed(0)}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: orange }}>Total Earnings</span>
            <Icons.trendingUp />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', padding: '0 16px', marginBottom: '28px' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.60)', borderRadius: '20px', padding: '18px 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>COMPLETED</p>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>{completedJobs} Jobs</p>
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.60)', borderRadius: '20px', padding: '18px 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>TOTAL HOURS</p>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>{totalHours} hrs</p>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <h3 style={{ margin: '0 0 14px', fontWeight: '700', fontSize: '17px', color: '#1a1a1a' }}>Recent Payments</h3>
        {payments.map((p, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '18px', padding: '14px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 3px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: '12px' }}>
              <Icons.personOutline />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{p.parentName}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{p.date}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>PKR {p.amount}</p>
              <span style={{ background: '#e6f9f0', color: '#27ae60', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>PAID</span>
            </div>
          </div>
        ))}
      </div>
      <BabysitterBottomNav />
    </div>
  );
};

export default Earnings;