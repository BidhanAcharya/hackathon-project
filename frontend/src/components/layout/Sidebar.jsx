import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

const seekerNav = [
  { label: 'Home', icon: '⊞', to: '/dashboard' },
  { label: 'Chat', icon: '💬', to: '/chat' },
  { label: 'Professional Support', icon: '🤝', to: '/professional-support' },
];

const helperNav = [
  { label: 'Clinical Dashboard', icon: '⊞', to: '/helper/dashboard' },
  { label: 'Settings', icon: '⚙', to: '/helper/settings' },
];

export default function Sidebar({ role = 'seeker', anonId = '4821' }) {
  const navigate = useNavigate();
  const navItems = role === 'helper' ? helperNav : seekerNav;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>+</span>
        <div>
          <div className={styles.logoName}>Mental Wizard</div>
          <div className={styles.logoSub}>MENTAL HEALTH SUPPORT</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        {role === 'seeker' ? (
          <>
            <NavLink to="/help" className={styles.navItem}>
              <span className={styles.navIcon}>?</span>
              <span className={styles.navLabel}>Help</span>
            </NavLink>
            <NavLink to="/logout" className={styles.navItem}>
              <span className={styles.navIcon}>↩</span>
              <span className={styles.navLabel}>Logout</span>
            </NavLink>
            <button className={styles.emergencyBtn} onClick={() => navigate('/emergency')}>
              Emergency Support
            </button>
          </>
        ) : (
          <div className={styles.helperProfile}>
            <div className={styles.anonAvatar} />
            <div>
              <div className={styles.helperName}>Dr. Aris</div>
              <div className={styles.helperStatus}>
                <span className={styles.statusDot} />
                Available
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
