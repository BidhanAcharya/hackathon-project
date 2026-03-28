import styles from './AnonId.module.css';

export default function AnonId({ id = '4821', size = 'md' }) {
  return (
    <span className={[styles.anonId, styles[size]].join(' ')}>
      Anon #{id}
    </span>
  );
}
