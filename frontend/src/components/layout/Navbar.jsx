import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>+</span>
        <span className={styles.logoName}>SereneCare</span>
      </div>
      <div className={styles.links}>
        <Link to="#features" className={styles.link}>Features</Link>
        <Link to="#how-it-works" className={styles.link}>How It Works</Link>
        <Link to="#community" className={styles.link}>Community</Link>
      </div>
      <button className={styles.ctaBtn} onClick={() => navigate('/onboarding')}>
        Get Started
      </button>
    </nav>
  );
}
