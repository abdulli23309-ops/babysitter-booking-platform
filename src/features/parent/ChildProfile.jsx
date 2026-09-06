import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import styles from './child-profile.module.css';

const calculateAge = (dob) => {
  if (!dob) return '?';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return Math.max(0, age);
};

export default function ChildProfile() {
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(userId));

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/parent/children/${userId}`);
        if (!response.ok) throw new Error('Failed to load children');
        const data = await response.json();
        if (!ignore) {
          setChildren(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!ignore) {
          setChildren([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  return (
    <div className={styles.childContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Children Profiles</h1>
        <div style={{ width: 42 }} />
      </div>

      {/* Hero Card */}
      <section className={styles.heroCard}>
        <h2 className={styles.heroTitle}>Nursery Care Management</h2>
        <p className={styles.heroDesc}>
          Register your children and include specific medical requirements or routines so caregivers are fully informed.
        </p>
      </section>

      {/* Children List */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text)' }}>
            Registered Children ({children.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--space-6) 0', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner size="md" label="Loading children..." />
          </div>
        ) : children.length === 0 ? (
          <EmptyState
            title="No Children Registered"
            description="Add your first child profile so you can proceed to booking trusted babysitters."
            actionLabel="Register Child"
            onAction={() => navigate('/set-child-profile')}
          />
        ) : (
          <div className={styles.childrenList}>
            {children.map((child, idx) => {
              const childId = child.Child_ID ?? child.id ?? idx;
              const name = child.Name ?? child.name ?? 'Child';
              const gender = child.Gender ?? child.gender ?? 'Not specified';
              const age = calculateAge(child.DOB ?? child.dob);
              const notes = child.SpecialInstructions ?? child.specialInstructions ?? null;

              return (
                <div key={childId} className={styles.childCard}>
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.childAvatar}>
                      👶
                    </div>
                    <div>
                      <h4 className={styles.childName}>{name}</h4>
                      <p className={styles.childMeta}>
                        {age} Years Old • {gender}
                      </p>
                    </div>
                  </div>

                  {notes && (
                    <div className={styles.notesBox}>
                      <span className={styles.notesLabel}>Special Care Notes:</span>
                      <p className={styles.notesText}>{notes}</p>
                    </div>
                  )}

                  <div className={styles.cardActions}>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => navigate('/update-child-profile', { state: { child } })}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Register New Child Action */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/set-child-profile')}
        >
          + Register Another Child
        </Button>
      </div>

      <ParentBottomNav />
    </div>
  );
}
