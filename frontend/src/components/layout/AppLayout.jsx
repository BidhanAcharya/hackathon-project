import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout({ children, role = 'seeker', anonId }) {
  return (
    <div className={styles.layout}>
      <Sidebar role={role} anonId={anonId} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
