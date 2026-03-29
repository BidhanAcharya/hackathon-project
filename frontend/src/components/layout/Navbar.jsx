import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className={styles.navbar}>
      <button className={styles.logo} onClick={() => navigate('/')}>
        <span className={styles.logoIcon}>+</span>
        <span className={styles.logoName}>Gunaso</span>
      </button>
      <div className={styles.ctaGroup}>
        <button className={styles.emergencyBtn} onClick={() => navigate('/emergency')}>
          🚨 Emergency
        </button>
        <button className={styles.ctaBtn} onClick={() => navigate('/signup')}>
          Get Started
        </button>
      </div>
    </nav>
  );
}
