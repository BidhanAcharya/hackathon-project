import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'md', fullWidth, onClick, type = 'button', disabled }) {
  return (
    <button
      type={type}
      className={[styles.btn, styles[variant], styles[size], fullWidth ? styles.fullWidth : ''].join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
