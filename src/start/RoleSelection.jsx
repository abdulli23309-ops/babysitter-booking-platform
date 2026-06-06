import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const selectRole = (role) => {
    navigate('/login', { state: { selectedRole: role } });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Choose Your Role</h2>
          <p style={styles.welcome}>Welcome to Little Care</p>
        </div>

        <div style={styles.card} onClick={() => selectRole('parent')}>
          <h3>👨‍👩‍👧 Parent</h3>
          <p>Find trusted care</p>
        </div>

        <div style={styles.card} onClick={() => selectRole('babysitter')}>
          <h3>👶 Baby Sitter</h3>
          <p>Offer your services</p>
        </div>
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
    background: 'linear-gradient(180deg, #f5c6d6, #b2d8d8)',
    overflow: 'auto',
  },
  container: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    textAlign: 'center',
  },
  header: {
    marginTop: '40px',
  },
  heading: {
    marginBottom: '8px',
  },
  welcome: {
    margin: 0,
    opacity: 0.8,
  },
  card: {
    marginTop: '40px',
    background: '#fff',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
};

export default RoleSelection;