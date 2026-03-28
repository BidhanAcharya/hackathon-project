import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import styles from './RequestBriefPage.module.css';

export default function RequestBriefPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();

  const handleAccept = () => navigate(`/helper/session/${requestId}`);
  const handlePass = () => navigate('/helper/dashboard');

  return (
    <AppLayout role="helper">
      <div className={styles.content}>
        <div className={styles.left}>
          <h1 className={styles.title}>Anonymous Request Brief — Anon #4821</h1>
          <blockquote className={styles.quote}>
            "Feeling overwhelmed with work stress and sudden anxiety peaks during meetings."
          </blockquote>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>What this person needs</h3>
            <ul className={styles.needsList}>
              <li>Immediate grounding — mindfulness or breathing exercises</li>
              <li>Permission validation — their feelings are real and okay</li>
              <li>Safe decompression space — no judgment, just listening</li>
            </ul>
          </div>

          <div className={styles.alertCard}>
            <span className={styles.alertIcon}>⚠</span>
            <div>
              <p className={styles.alertTitle}>Critical Clinical Markers</p>
              <p className={styles.alertText}>Signs of acute distress — recommend structured, grounded approach in the first few minutes.</p>
            </div>
          </div>

          <div className={styles.resources}>
            <div className={styles.resourceThumb} />
            <div className={styles.resourceThumb} />
            <div className={styles.resourceThumb} />
          </div>
        </div>

        <div className={styles.right}>
          <p className={styles.actionsLabel}>SUGGESTED ACTIONS</p>
          <button className={styles.acceptBtn} onClick={handleAccept}>✓ Accept Session</button>
          <button className={styles.passBtn} onClick={handlePass}>→ Pass to Another Helper</button>

          <div className={styles.helperStats}>
            <div className={styles.statRow}><span>Sessions</span><strong>142</strong></div>
            <div className={styles.statRow}><span>Rating</span><strong>4.9 ★</strong></div>
            <div className={styles.statRow}><span>Response Rate</span><strong>98%</strong></div>
          </div>

          <p className={styles.resourcesLabel}>SUGGESTED RESOURCES</p>
          <div className={styles.resourceLinks}>
            <a className={styles.resourceLink} href="#">5-min Box Breathing Guide</a>
            <a className={styles.resourceLink} href="#">Work Stress Framework</a>
            <a className={styles.resourceLink} href="#">Grounding Techniques</a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
