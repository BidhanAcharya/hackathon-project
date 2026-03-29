import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { getHelpSessionDetail, acceptHelpRequest } from '../../api/endpoints';
import styles from './RequestBriefPage.module.css';

export default function RequestBriefPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      try {
        const data = await getHelpSessionDetail(requestId);
        setSessionData(data);
      } catch (err) {
        console.error('Failed to fetch session detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [requestId]);

  const assessment = sessionData?.initial_assessment;
  const prefs = sessionData?.preferences || {};
  const userId = sessionData?.user_id;
  const tags = assessment?.tags || assessment?.areas_of_concern || [];
  const categories = prefs.categories || [];

  const handleOpenSession = async () => {
    try {
      setAccepting(true);
      await acceptHelpRequest(requestId);
      navigate(`/helper/session/${requestId}`);
    } catch (err) {
      console.error('Failed to accept session:', err);
      alert('Failed to accept session. It may have already been accepted.');
    } finally {
      setAccepting(false);
    }
  };
  const handlePass = () => navigate('/helper/dashboard');

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        <div className={styles.maxWidth}>
          <button className={styles.backBtn} onClick={() => navigate('/helper/dashboard')}>
            ← Back to Dashboard
          </button>
          {loading && <p>Loading session details...</p>}
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div>
              <div className={styles.urgencyIndicator}>
                <span className={styles.urgencyDot} />
                <span className={styles.urgencyLabel}>{assessment?.severity || 'Pending'} Urgency Request</span>
              </div>
              <h2 className={styles.pageTitle}>Anonymous Request Brief — User #{userId || '...'}</h2>
            </div>
            <div className={styles.tagRow}>
              {tags.length > 0 ? tags.map((tag, i) => (
                <span className={styles.tag} key={i}>{tag}</span>
              )) : categories.length > 0 ? categories.map((c, i) => (
                <span className={styles.tag} key={i}>{c}</span>
              )) : <span className={styles.tag}>General</span>}
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
                  {assessment?.summary || assessment?.description || 'No assessment available yet.'}
                </p>
              </div>

              {/* User's own request */}
              {prefs.message && (
                <div className={styles.summaryCard}>
                  <p className={styles.cardLabel}>User's Request</p>
                  <p className={styles.summaryQuote} style={{ fontStyle: 'italic' }}>"{prefs.message}"</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
                    {prefs.helper_type && (
                      <span style={{ fontSize: '0.78rem', background: 'var(--color-surface-alt, #f3f4f6)', borderRadius: '12px', padding: '3px 10px', color: 'var(--color-text-muted)' }}>
                        {prefs.helper_type === 'therapist' ? '🩺 Requested Therapist' : '🤝 Requested Peer Supporter'}
                      </span>
                    )}
                    {categories.map(c => (
                      <span key={c} style={{ fontSize: '0.78rem', background: 'var(--color-surface-alt, #f3f4f6)', borderRadius: '12px', padding: '3px 10px', color: 'var(--color-text-muted)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

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
                  <button className={styles.acceptBtn} onClick={handleOpenSession} disabled={accepting}>
                    {accepting ? '⏳ Accepting...' : '▶ Open Session'}
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

        </div>
      </div>
    </AppLayout>
  );
}
