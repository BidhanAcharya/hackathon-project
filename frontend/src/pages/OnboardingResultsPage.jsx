import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import styles from './OnboardingResultsPage.module.css';

export default function OnboardingResultsPage() {
  const navigate = useNavigate();
  const { answers } = useOnboarding();
  const { loginAsSeeker } = useAuth();

  const handleGoToDashboard = () => {
    const anonId = Math.floor(1000 + Math.random() * 9000).toString();
    loginAsSeeker(anonId, 'mock-token');
    navigate('/dashboard');
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.anonId}>Anon #4821</div>
        <div className={styles.actions}>
          <button className={styles.helpBtn}>?</button>
          <div className={styles.avatar} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.headline}>Understanding your path.</h1>
          <p className={styles.headlineHi}>आपकी राह को समझना।</p>

          <p className={styles.body}>
            Take a moment to breathe and look through what you may be carrying right now.
          </p>

          <div className={styles.conditionBadge}>
            Moderate stress + low mood
          </div>

          <p className={styles.empathy}>
            Based on what you've shared, it sounds like you've been carrying quite a bit lately —
            especially around work and the weight of daily pressure. That's real, and it matters.
          </p>
          <p className={styles.empathyHi}>
            आपने जो साझा किया है, उससे लगता है कि आप बहुत कुछ उठाए हुए हैं।
          </p>

          <div className={styles.tipCard}>
            <p className={styles.tipLabel}>TRY THIS TODAY</p>
            <p className={styles.tipText}>A 5-minute deep breathing exercise to help calm your nervous system and reset your focus.</p>
            <button className={styles.tipBtn}>Start breathing guide →</button>
          </div>

          <button className={styles.dashboardBtn} onClick={handleGoToDashboard}>
            Go to my space
          </button>

          <p className={styles.footerLine}>EVERYTHING IS READY FOR YOU</p>
        </div>
      </div>
    </div>
  );
}
