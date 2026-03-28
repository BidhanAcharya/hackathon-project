import styles from './TagChip.module.css';

export default function TagChip({ label, color = 'default', onClick }) {
  return (
    <span
      className={[styles.chip, styles[color], onClick ? styles.clickable : ''].join(' ')}
      onClick={onClick}
    >
      {label}
    </span>
  );
}
