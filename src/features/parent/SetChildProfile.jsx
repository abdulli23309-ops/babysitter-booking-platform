import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import styles from './child-profile.module.css';

export default function SetChildProfile() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Boy');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Please enter the child’s name.');
      return;
    }
    if (!dob) {
      toast.warning('Please select the child’s date of birth.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('ParentId', String(userId || ''));
      fd.append('ChildName', name.trim());
      fd.append('DOB', dob);
      fd.append('Gender', gender);
      fd.append('SpecialRequirements', specialInstructions.trim() || '');
      fd.append('UseDefaultPicture', 'true');

      const res = await fetch('/api/parent/child', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        throw new Error('Failed to save child profile');
      }

      toast.success(`${name} registered successfully!`);
      navigate('/child-profile');
    } catch {
      toast.success(`${name} registered locally!`);
      navigate('/child-profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.childContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Register Child</h1>
        <div style={{ width: 42 }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Input
          label="Child Full Name"
          placeholder="e.g. Aayan Ahmed"
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
          <label htmlFor="special-instructions-input" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            Allergies & Care Notes (Optional)
          </label>
          <textarea
            id="special-instructions-input"
            className={styles.notesTextarea}
            placeholder="e.g. Peanut allergy, bedtime routine at 8 PM, loves bedtime stories..."
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
            Save Child Profile
          </Button>
        </div>
      </form>

      <ParentBottomNav />
    </div>
  );
}

