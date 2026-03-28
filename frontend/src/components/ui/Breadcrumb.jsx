import { useNavigate } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

/**
 * items: [{ label, to }]  — last item has no `to` (current page)
 */
export default function Breadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className={styles.item}>
            {!isLast ? (
              <>
                <button className={styles.link} onClick={() => navigate(item.to)}>
                  {item.label}
                </button>
                <span className={styles.sep}>›</span>
              </>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
