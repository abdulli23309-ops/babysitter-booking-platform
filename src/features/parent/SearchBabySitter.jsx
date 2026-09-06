import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ParentBottomNav from '../../components/layout/ParentBottomNav';
import BackButton from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import styles from './search-babysitter.module.css';

const buildImageUrl = (pic) => {
  if (!pic) return 'https://i.pravatar.cc/100?img=47';
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const parts = pic.split('/');
  if (parts.length === 2) {
    const [type, filename] = parts;
    return `/api/images/${type}/${filename}`;
  }
  return `/api/images/default/${pic}`;
};

export default function SearchBabySitter() {
  const navigate = useNavigate();

  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [minExp, setMinExp] = useState(0);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchSitters() {
      try {
        const res = await fetch('/api/matching/search-sitters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setSitters(Array.isArray(data) ? data : []);
          }
        }
      } catch {
        if (!ignore) {
          setSitters([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchSitters();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredSitters = useMemo(() => {
    return sitters.filter((sitter) => {
      if (sitter.IsDeleted || sitter.IsActive === false) return false;

      const name = (sitter.FullName ?? sitter.name ?? '').toLowerCase();
      const city = (sitter.City ?? sitter.city ?? '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = !term || name.includes(term) || city.includes(term);
      const matchesRating = minRating === 0 || (Number(sitter.Rating) || 5) >= minRating;
      const matchesExp = minExp === 0 || (Number(sitter.ExperienceYears) || 0) >= minExp;

      return matchesSearch && matchesRating && matchesExp;
    });
  }, [sitters, searchTerm, minRating, minExp]);

  const handleSitterClick = (sitter) => {
    navigate('/babysitter-details', { state: { sitter } });
  };

  return (
    <div className={styles.searchContainer}>
      {/* Top Header */}
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.pageTitle}>Find Babysitter</h1>
        <button
          type="button"
          className={styles.filterBtn}
          onClick={() => setFilterModalOpen(true)}
          aria-label="Filter"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, city, or area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearchTerm('')}
            aria-label="Clear Search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className={styles.chipsRow}>
        <button
          type="button"
          className={`${styles.chip} ${minRating === 4 ? styles.chipActive : ''}`}
          onClick={() => setMinRating((prev) => (prev === 4 ? 0 : 4))}
        >
          ★ 4.0+ Stars
        </button>
        <button
          type="button"
          className={`${styles.chip} ${minExp === 3 ? styles.chipActive : ''}`}
          onClick={() => setMinExp((prev) => (prev === 3 ? 0 : 3))}
        >
          3+ Yrs Exp
        </button>
        <button
          type="button"
          className={styles.chip}
          onClick={() => setFilterModalOpen(true)}
        >
          Filters ⚙️
        </button>
      </div>

      {/* Sitter Results */}
      {loading ? (
        <div style={{ padding: 'var(--space-8) 0', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner size="lg" label="Finding verified caregivers..." />
        </div>
      ) : filteredSitters.length === 0 ? (
        <EmptyState
          title="No Caregivers Found"
          description="Try broadening your search term or clearing your rating filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchTerm('');
            setMinRating(0);
            setMinExp(0);
          }}
        />
      ) : (
        <div className={styles.sittersList}>
          {filteredSitters.map((sitter, idx) => {
            const sitterId = sitter.BabySitter_ID ?? sitter.id ?? idx;
            const name = sitter.FullName ?? sitter.name ?? 'Caregiver';
            const city = sitter.City ?? sitter.city ?? 'Islamabad';
            const rating = Number(sitter.Rating) || 5.0;
            const rate = sitter.HourlyRate ?? 500;
            const exp = sitter.ExperienceYears ?? 1;
            const pic = buildImageUrl(sitter.PictureAddress ?? sitter.profilePicture);

            return (
              <div
                key={sitterId}
                className={styles.sitterCard}
                onClick={() => handleSitterClick(sitter)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSitterClick(sitter)}
              >
                <div className={styles.cardAvatarWrap}>
                  <img
                    src={pic}
                    alt={name}
                    className={styles.cardAvatar}
                    onError={(e) => { e.target.src = 'https://i.pravatar.cc/100?img=47'; }}
                  />
                  <span className={styles.onlineBadge} />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardHeaderRow}>
                    <h3 className={styles.sitterName}>{name}</h3>
                    <span className={styles.ratePill}>PKR {rate}/hr</span>
                  </div>
                  <p className={styles.sitterCity}>📍 {city}</p>
                  <div className={styles.cardMetaRow}>
                    <span className={styles.metaItem}>★ {rating.toFixed(1)}</span>
                    <span>•</span>
                    <span className={styles.metaItem}>{exp} {exp === 1 ? 'Year' : 'Years'} Exp</span>
                    <span>•</span>
                    <span className={styles.verifiedTag}>Verified</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Filter Modal */}
      <Modal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filter Caregivers"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Minimum Rating
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.chip} ${minRating === r ? styles.chipActive : ''}`}
                  onClick={() => setMinRating(r)}
                  style={{ flex: 1 }}
                >
                  {r === 0 ? 'Any' : `${r}★+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Minimum Experience
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {[0, 1, 3, 5].map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`${styles.chip} ${minExp === e ? styles.chipActive : ''}`}
                  onClick={() => setMinExp(e)}
                  style={{ flex: 1 }}
                >
                  {e === 0 ? 'Any' : `${e}+ Yrs`}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => setFilterModalOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </Modal>

      <ParentBottomNav />
    </div>
  );
}

