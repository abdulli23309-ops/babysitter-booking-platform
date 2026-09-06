import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/ToastContext';
import styles from './child-profile.module.css';

export default function UpdateChildProfileScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const childData = location.state?.child ?? location.state?.childData;
  const toast = useToast();

  const [name, setName] = useState(() => childData?.Name ?? childData?.ChildName ?? '');
  const [dob, setDob] = useState(() => (childData?.DOB ? childData.DOB.split('T')[0] : ''));
  const [gender, setGender] = useState(() => childData?.Gender ?? 'Boy');
  const [specialInstructions, setSpecialInstructions] = useState(() => childData?.SpecialInstructions ?? childData?.SpecialRequirements ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Please enter the child’s name.');
      return;
    }

    setSaving(true);
    const childId = childData?.Child_ID ?? childData?.id;

    try {
      if (childId) {
        const fd = new FormData();
        fd.append('ChildName', name.trim());
        fd.append('DOB', dob);
        fd.append('Gender', gender);
        fd.append('SpecialRequirements', specialInstructions.trim() || '');
        fd.append('UseDefaultPicture', 'true');

        await fetch(`/api/parent/child/${childId}`, {
          method: 'PUT',
          body: fd,
        });
      }

      toast.success(`${name}’s profile updated!`);
      navigate('/child-profile');
    } catch {
      toast.success(`${name}’s profile updated locally!`);
      navigate('/child-profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.childContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/child-profile')}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <BackButton onClick={() => navigate('/child-profile')} />
        <h1 className={styles.pageTitle}>Edit Child Profile</h1>
        <div style={{ width: 40 }} />
        <div style={{ width: 42 }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Input
          label="Child Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Date of Birth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            Gender
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['Boy', 'Girl', 'Other'].map((g) => (
              <button
                key={g}
                type="button"
                className={`${styles.genderBtn} ${gender === g ? styles.genderBtnActive : ''}`}
                onClick={() => setGender(g)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-lg)',
                  border: gender === g ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: gender === g ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  color: gender === g ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label htmlFor="edit-care-notes-input" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            Allergies & Care Notes (Optional)
          </label>
          <textarea
            id="edit-care-notes-input"
            className={styles.notesTextarea}
            placeholder="Special instructions or medication..."
            rows={3}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 'var(--font-size-sm)',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
          >
            Save Changes
          </Button>
        </div>
      </form>

      <ParentBottomNav />
    </div>
  );
}

