import styles from './ProgressBar.module.css';

export default function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.label}>{pct}% complete</span>
    </div>
  );
}
