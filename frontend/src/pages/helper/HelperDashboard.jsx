import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getPendingRequests, getActiveSessions } from '../../api/endpoints';
import styles from './HelperDashboard.module.css';

export default function HelperDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    async function fetchPending() {
      if (!user?.userId) return;
      try {
        const data = await getPendingRequests(user.userId);
        setPendingRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch pending requests:', err);
        setPendingRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    }
    fetchPending();

    async function fetchActive() {
      if (!user?.userId) return;
      try {
        const data = await getActiveSessions(user.userId);
        setActiveSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch active sessions:', err);
        setActiveSessions([]);
      } finally {
        setLoadingSessions(false);
      }
    }
    fetchActive();
  }, [user?.userId]);

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.welcomeTitle}>Welcome back, {user?.username || 'Helper'}</h1>
          <p className={styles.welcomeSub}>Your clinical overview for today.</p>
        </header>

        {/* Stat Cards */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Sessions</p>
            <h3 className={styles.statValue}>{activeSessions.length}</h3>
            <div className={styles.statMeta + ' ' + styles.metaGreen}>
              <span className={styles.trendIcon}>●</span> Live
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Avg Rating</p>
            <h3 className={styles.statValue}>4.9</h3>
            <div className={styles.statMeta + ' ' + styles.metaOrange}>
              ★ Top 5% of Helpers
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Response Rate</p>
            <h3 className={styles.statValue}>98%</h3>
            <div className={styles.statMeta + ' ' + styles.metaGreen}>
              ✓ Exceeding target
            </div>
          </div>
          <div className={styles.statCardOnline}>
            <p className={styles.statLabelLight}>Online Now</p>
            <h3 className={styles.statValueLight}>Active</h3>
            <div className={styles.onlineStatus}>
              <span className={styles.onlinePulse} />
              Visible to patients
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <div className={styles.bentoGrid}>
          {/* Incoming Requests */}
          <section className={styles.requestsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Incoming Requests</h2>
              <span className={styles.newBadge}>{pendingRequests.length} Pending</span>
            </div>
            <div className={styles.requestList}>
              {loadingRequests ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>Loading requests...</p>
              ) : pendingRequests.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>No pending requests at the moment.</p>
              ) : (
                pendingRequests.map((req) => {
                  const prefs = req.preferences || {};
                  return (
                <div
                  key={req.session_id}
                  className={[styles.requestCard, styles.urgency_moderate].join(' ')}
                >
                  <div className={styles.requestTop}>
                    <div className={styles.requestMeta}>
                      <span className={styles.reqAnon}>User #{req.user_id}</span>
                      <span className={[styles.urgencyBadge, styles.badge_moderate].join(' ')}>
                        <span className={styles.urgencyDot} />
                        {prefs.helper_type === 'therapist' ? '🩺 Therapist Req.' : '🤝 Peer Req.'}
                      </span>
                    </div>
                    <button
                      className={styles.viewBriefBtn}
                      onClick={() => navigate(`/helper/request/${req.session_id}`)}
                    >
                      View Brief <span>›</span>
                    </button>
                  </div>
                  {prefs.categories && prefs.categories.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '6px 0' }}>
                      {prefs.categories.map(c => (
                        <span key={c} style={{ fontSize: '0.72rem', background: 'var(--color-surface-alt, #f3f4f6)', borderRadius: '12px', padding: '2px 10px', color: 'var(--color-text-muted)' }}>{c}</span>
                      ))}
                    </div>
                  )}
                  {prefs.message && (
                    <p className={styles.reqSnippet}>"{prefs.message}"</p>
                  )}
                  <p className={styles.reqTime}>
                    {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Active Sessions */}
          <section className={styles.sessionsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Sessions</h2>
              <button className={styles.viewAllLink}>View All Sessions</button>
            </div>
            <div className={styles.sessionList}>
              {loadingSessions ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>Loading sessions...</p>
              ) : activeSessions.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>No active sessions.</p>
              ) : (
                activeSessions.map((s) => (
                  <div key={s.session_id} className={styles.sessionRow}>
                    <div className={styles.sessionLeft}>
                      <div className={styles.sessionAvatar}>
                        {String(s.user_id).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.sessionUserId}>User #{s.user_id}</p>
                        <p className={styles.sessionDuration}>
                          Started {new Date(s.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={styles.sessionOnlineDot} />
                    <button
                      className={styles.goToChatBtn}
                      onClick={() => navigate(`/helper/session/${s.session_id}`)}
                    >
                      💬 Go to Chat
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Capacity Card */}
            <div className={styles.capacityCard}>
              <h4 className={styles.capacityTitle}>Capacity Update</h4>
              <p className={styles.capacityText}>
                You've handled 24 requests today. Taking a 5-minute breather can improve your response quality.
              </p>
              <button className={styles.capacityBtn}>Set Break Timer</button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
