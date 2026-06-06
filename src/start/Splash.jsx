import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG icons (unchanged)
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.12">
    <polygon points="12,2 15,9 22,9 16,14 19,21 12,17 5,21 8,14 2,9 9,9" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.12">
    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
  </svg>
);

const HappyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.12">
    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM8,9a1.5,1.5,0,1,1,1.5,1.5A1.5,1.5,0,0,1,8,9Zm8,0a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,9Zm-8,5c1.5,2,3.5,2,5,0" />
  </svg>
);

const PawIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.12">
    <path d="M12,13a2,2,0,0,0,2-2V6A2,2,0,0,0,10,6v5A2,2,0,0,0,12,13Zm6-2a2,2,0,0,0-2,2v1a2,2,0,0,0,4,0V13A2,2,0,0,0,18,11ZM6,11a2,2,0,0,0-2,2v1a2,2,0,0,0,4,0V13A2,2,0,0,0,6,11ZM12,9a2,2,0,0,0,2-2V3a2,2,0,0,0-4,0V7A2,2,0,0,0,12,9ZM3,13a2,2,0,0,0,4,0V11a2,2,0,0,0-4,0v2ZM17,13a2,2,0,0,0,4,0V11a2,2,0,0,0-4,0v2Z" />
  </svg>
);

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/role', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.overlay}>
      {/* Floating icons */}
      <div style={{ ...styles.floatingIcon, top: '20%', left: '40%' }}><StarIcon /></div>
      <div style={{ ...styles.floatingIcon, top: '80%', left: '70%' }}><HeartIcon /></div>
      <div style={{ ...styles.floatingIcon, top: '60%', left: '20%' }}><HappyIcon /></div>
      <div style={{ ...styles.floatingIcon, top: '10%', left: '80%' }}><PawIcon /></div>

      {/* Centered content */}
      <div style={styles.content}>
        <h1 style={styles.title}>
          Baby Sitter Booking <br /> & Baby Minder
        </h1>
        <p style={styles.subtitle}>From Little Care</p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #f5c6d6 0%, #b2d8d8 100%)',
    overflow: 'hidden',
  },
  floatingIcon: {
    position: 'absolute',
    color: '#0b0a0a',
  },
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 24px',
    color: '#1a1a1a',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '2.2rem',
    margin: 0,
    lineHeight: 1.3,
  },
  subtitle: {
    marginTop: '16px',
    fontSize: '1.2rem',
    opacity: 0.8,
  },
};

export default Splash;