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
      <div className={styles.page}>
        <div className={styles.maxWidth}>
          <button className={styles.backBtn} onClick={() => navigate('/helper/dashboard')}>
            ← Back to Dashboard
          </button>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div>
              <div className={styles.urgencyIndicator}>
                <span className={styles.urgencyDot} />
                <span className={styles.urgencyLabel}>High Urgency Request</span>
              </div>
              <h2 className={styles.pageTitle}>Anonymous Request Brief — Anon #4821</h2>
            </div>
            <div className={styles.tagRow}>
              <span className={styles.tag}>Work Stress</span>
              <span className={styles.tag}>Anxiety</span>
            </div>
          </div>

          {/* Bento Grid */}
          <div className={styles.bentoGrid}>
            {/* Left Column */}
            <div className={styles.leftCol}>
              {/* Patient Summary */}
              <div className={styles.summaryCard}>
                <p className={styles.cardLabel}>Patient Summary</p>
                <p className={styles.summaryQuote}>
                  "Feeling overwhelmed with work stress and sudden anxiety peaks during meetings."
                </p>
              </div>

              {/* What this person needs */}
              <div className={styles.needsCard}>
                <div className={styles.needsHeader}>
                  <span className={styles.needsIcon}>🧠</span>
                  <h3 className={styles.needsTitle}>What this person needs</h3>
                </div>
                <div className={styles.needsList}>
                  <div className={styles.needItem}>
                    <div className={styles.needNumber}>1</div>
                    <div>
                      <h4 className={styles.needItemTitle}>Immediate grounding techniques</h4>
                      <p className={styles.needItemText}>Provide actionable exercises for acute anxiety during high-pressure work scenarios.</p>
                    </div>
                  </div>
                  <div className={styles.needItem}>
                    <div className={styles.needNumber}>2</div>
                    <div>
                      <h4 className={styles.needItemTitle}>Professional validation</h4>
                      <p className={styles.needItemText}>Acknowledge and validate the validity of their work-related stressors as real clinical factors.</p>
                    </div>
                  </div>
                  <div className={styles.needItem}>
                    <div className={styles.needNumber}>3</div>
                    <div>
                      <h4 className={styles.needItemTitle}>Safe decompression space</h4>
                      <p className={styles.needItemText}>Establish a non-judgmental environment where they can vent without fear of professional repercussions.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Reminder */}
              <div className={styles.warningBanner}>
                <div className={styles.warningIconWrap}>⚠</div>
                <div className={styles.warningBody}>
                  <p className={styles.warningTitle}>Critical Clinical Reminder</p>
                  <p className={styles.warningText}>Escalate if you detect crisis signals or self-harm ideation during the discourse.</p>
                </div>
                <button className={styles.warningLink}>View Protocol</button>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.rightCol}>
              <div className={styles.actionPanel}>
                <p className={styles.cardLabel}>Session Actions</p>
                <div className={styles.actionBtns}>
                  <button className={styles.acceptBtn} onClick={handleAccept}>
                    ✓ Accept Session
                  </button>
                  <button className={styles.passBtn} onClick={handlePass}>
                    → Pass to another helper
                  </button>
                </div>

                <div className={styles.metaRows}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Session ETA</span>
                    <span className={styles.metaValueBlue}>Instant</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>Anonymity Level</span>
                    <span className={styles.metaValueGreen}>Full (Encrypted)</span>
                  </div>
                </div>

                <div className={styles.guidelinesBox}>
                  <div className={styles.guidelinesHeader}>
                    <div className={styles.guidelinesIcon}>ℹ</div>
                    <span className={styles.guidelinesTitle}>Helper Guidelines</span>
                  </div>
                  <p className={styles.guidelinesText}>
                    By accepting, you commit to providing empathetic, clinical-grade support for the next 45 minutes minimum.
                  </p>
                </div>
              </div>

              {/* Suggested Approach */}
              <div className={styles.approachCard}>
                <p className={styles.approachLabel}>Suggested Approach</p>
                <p className={styles.approachText}>
                  Based on the keywords "Overwhelmed" and "Meetings", consider beginning with a 2-minute breathing anchor to settle the physiological baseline before deep-diving into work triggers.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative image strip */}
          <div className={styles.imageStrip}>
            <div className={[styles.imageThumb, styles.img1].join(' ')} />
            <div className={[styles.imageThumb, styles.img2].join(' ')} />
            <div className={[styles.imageThumb, styles.img3].join(' ')} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
