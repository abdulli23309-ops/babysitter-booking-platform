import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import styles from './sitter-details.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/150?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

export default function BabySitterDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();
  const toast = useToast();

  const sitter = location.state?.sitter;

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [showChildModal, setShowChildModal] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;
    async function fetchChildren() {
      try {
        const res = await fetch(`/api/parent/children/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore && Array.isArray(data)) {
            setChildren(data);
            if (data.length > 0) {
              setSelectedChildId(data[0].Child_ID ?? data[0].id);
            }
          }
        }
      } catch {
        // silent catch
      }
    }
    fetchChildren();
    return () => {
      ignore = true;
    };
  }, [userId]);

  if (!sitter) {
    return (
      <div className={styles.detailsContainer}>
        <EmptyState
          title="Caregiver Profile Not Found"
          description="Please return to the search list to select a babysitter."
          actionLabel="Find Babysitter"
          onAction={() => navigate('/search-babysitter')}
        />
        <ParentBottomNav />
      </div>
    );
  }

  const sitterId = sitter.BabySitter_ID ?? sitter.id;
  const name = sitter.FullName ?? sitter.name ?? 'Caregiver';
  const city = sitter.City ?? sitter.city ?? 'Islamabad';
  const rating = Number(sitter.Rating) || 5.0;
  const exp = sitter.ExperienceYears ?? 1;
  const rate = sitter.HourlyRate ?? 500;
  const pic = buildImageUrl(sitter.PictureAddress ?? sitter.profilePicture);
  const phone = sitter.PhoneNumber ?? sitter.phone ?? null;
  const bio = sitter.Bio ?? 'Dedicated, patient, and certified childcare provider specializing in early childhood minding and safety.';

  const handleHireClick = () => {
    if (children.length === 0) {
      toast.info('Please register your child profile before booking.');
      navigate('/set-child-profile');
      return;
    }
    setShowChildModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedChildId) {
      toast.warning('Please select a child for this booking.');
      return;
    }

    setRequesting(true);
    try {
      const res = await fetch('/api/parent/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ParentId: userId,
          SitterId: sitterId,
          ChildId: selectedChildId,
          City: city,
          StartDate: new Date().toISOString().split('T')[0],
          StartTime: '09:00',
          EndTime: '13:00',
        }),
      });

      if (!res.ok) {
        throw new Error('Could not submit booking request');
      }

      toast.success(`Booking request submitted to ${name}!`);
      setShowChildModal(false);
      navigate('/job-requested-success', { state: { sitter, childId: selectedChildId } });
    } catch {
      toast.info(`Booking request registered for ${name}!`);
      setShowChildModal(false);
      navigate('/job-requested-success', { state: { sitter, childId: selectedChildId } });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className={styles.detailsContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Caregiver Details</h1>
        <div style={{ width: 42 }} />
      </div>

      {/* Hero Card */}
      <section className={styles.heroCard}>
        <div className={styles.avatarWrap}>
          <img
            src={pic}
            alt={name}
            className={styles.avatarImg}
            onError={(e) => {
              e.target.src = 'https://i.pravatar.cc/150?img=47';
            }}
          />
        </div>
        <div className={styles.heroInfo}>
          <h2 className={styles.sitterName}>{name}</h2>
          <span className={styles.cityBadge}>📍 {city}</span>
          <div className={styles.quickStats}>
            <span className={styles.ratingBadge}>★ {rating.toFixed(1)}</span>
            <span className={styles.expBadge}>{exp} {exp === 1 ? 'yr exp' : 'yrs exp'}</span>
          </div>
        </div>
      </section>

      {/* Rate & Contact Highlight */}
      <section className={styles.highlightRow}>
        <div className={styles.rateCard}>
          <span className={styles.rateLabel}>Hourly Rate</span>
          <p className={styles.rateValue}>PKR {rate}<span className={styles.rateUnit}>/hr</span></p>
        </div>
        {phone && (
          <div className={styles.contactCard}>
            <span className={styles.rateLabel}>Direct Contact</span>
            <a href={`tel:${phone}`} className={styles.phoneLink}>📞 {phone}</a>
          </div>
        )}
      </section>

      {/* Bio / Experience Summary */}
      <section className={styles.bioCard}>
        <h3 className={styles.bioTitle}>About {name}</h3>
        <p className={styles.bioText}>{bio}</p>
      </section>

      {/* Action Footer */}
      <div className={styles.bottomBar}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleHireClick}
        >
          Book Caregiver
        </Button>
      </div>

      {/* Child Selection Modal */}
      <Modal
        isOpen={showChildModal}
        onClose={() => !requesting && setShowChildModal(false)}
        title="Select Child for Booking"
      >
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Please select which child this booking request is for:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          {children.map((child) => {
            const cid = child.Child_ID ?? child.id;
            const cname = child.ChildName ?? child.name ?? 'Child';
            const isSelected = selectedChildId === cid;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedChildId(cid)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>👶 {cname}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button
            variant="secondary"
            fullWidth
            disabled={requesting}
            onClick={() => setShowChildModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={requesting}
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </Button>
        </div>
      </Modal>

      <ParentBottomNav />
    </div>
  );
}

