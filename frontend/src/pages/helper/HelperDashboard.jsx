import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getOpenRequests, getHelperSessions, acceptHelpRequest } from '../../api/helpRequest';
import styles from './HelperDashboard.module.css';

const CATEGORIES = [
  { label: 'Anxiety', icon: '🌀' },
  { label: 'Work Stress', icon: '💼' },
  { label: 'Relationships', icon: '❤️' },
  { label: 'Sleep', icon: '🌙' },
  { label: 'Grief', icon: '🕊️' },
  { label: 'Career', icon: '🎯' },
  { label: 'Self-esteem', icon: '🌱' },
  { label: 'Other', icon: '💬' },
];

export default function HelperDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState('requests'); // 'requests' | 'sessions'
  const [openRequests, setOpenRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [accepting, setAccepting] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]); // selected category labels

  const loadData = useCallback(() => {
    if (!user?.accessToken) return;
    getOpenRequests(user.accessToken)
      .then(data => setOpenRequests(data))
      .catch(() => {});
    getHelperSessions(user.accessToken)
      .then(data => setMySessions(data))
      .catch(() => {});
  }, [user?.accessToken]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAccept = async (sessionId) => {
    if (!user?.accessToken || accepting) return;
    setAccepting(sessionId);
    try {
      await acceptHelpRequest(sessionId, user.accessToken);
      loadData(); // request disappears from open list, appears in My Sessions
    } catch (err) {
      alert(err.message || 'Failed to accept request.');
    } finally {
      setAccepting(null);
    }
  };

  const toggleFilter = (label) => {
    setActiveFilters(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  // Apply category filter
  const filteredRequests = activeFilters.length === 0
    ? openRequests
    : openRequests.filter(req =>
        (req.categories || []).some(c => activeFilters.includes(c))
      );

  const activeSessions = mySessions.filter(s => s.status === 'active');

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className={styles.welcomeTitle}>Welcome back, {user?.alias || user?.username || 'Helper'}</h1>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              background: user?.helperRole === 'therapist' ? '#e0f4ff' : '#f0eeff',
              color: user?.helperRole === 'therapist' ? '#0ea5e9' : '#6c63ff',
              border: `1.5px solid ${user?.helperRole === 'therapist' ? '#bae6fd' : '#c4b5fd'}`,
            }}>
              {user?.helperRole === 'therapist' ? '🩺 Verified Therapist' : '🤝 Peer Supporter'}
            </span>
          </div>
          <p className={styles.welcomeSub}>Your clinical overview for today.</p>
        </header>

        {/* Stat Cards */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Sessions</p>
            <h3 className={styles.statValue}>{activeSessions.length}</h3>
            <div className={styles.statMeta + ' ' + styles.metaGreen}>
              <span className={styles.trendIcon}>↑</span> Live sessions
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Open Requests</p>
            <h3 className={styles.statValue}>{openRequests.length}</h3>
            <div className={styles.statMeta + ' ' + styles.metaOrange}>
              Awaiting helpers
            </div>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Accepted</p>
            <h3 className={styles.statValue}>{mySessions.length}</h3>
            <div className={styles.statMeta + ' ' + styles.metaGreen}>
              ✓ All time
            </div>
          </div>
          <div className={styles.statCardOnline}>
            <p className={styles.statLabelLight}>Online Now</p>
            <h3 className={styles.statValueLight}>Active</h3>
            <div className={styles.onlineStatus}>
              <span className={styles.onlinePulse} />
              Visible to seekers
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={[styles.tabBtn, tab === 'requests' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('requests')}
          >
            All Requests
            {openRequests.length > 0 && (
              <span className={styles.tabBadge}>{openRequests.length}</span>
            )}
          </button>
          <button
            className={[styles.tabBtn, tab === 'sessions' ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab('sessions')}
          >
            My Sessions
            {mySessions.length > 0 && (
              <span className={styles.tabBadge}>{mySessions.length}</span>
            )}
          </button>
        </div>

        {/* ── Tab: All Requests ── */}
        {tab === 'requests' && (
          <div className={styles.tabContent}>
            {/* Category Filter */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Filter by topic:</span>
              <div className={styles.filterChips}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    className={[
                      styles.filterChip,
                      activeFilters.includes(cat.label) ? styles.filterChipActive : '',
                    ].join(' ')}
                    onClick={() => toggleFilter(cat.label)}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
                {activeFilters.length > 0 && (
                  <button
                    className={styles.filterClear}
                    onClick={() => setActiveFilters([])}
                  >
                    Clear ✕
                  </button>
                )}
              </div>
            </div>

            {/* Request List */}
            <div className={styles.requestList}>
              {filteredRequests.length === 0 && (
                <p className={styles.emptyState}>
                  {activeFilters.length > 0
                    ? 'No requests match the selected filters.'
                    : 'No open requests right now. Check back soon.'}
                </p>
              )}
              {filteredRequests.map((req) => (
                <div key={req.session_id} className={[styles.requestCard, styles.urgency_moderate].join(' ')}>
                  <div className={styles.requestTop}>
                    <div className={styles.requestMeta}>
                      <span className={styles.reqAnon}>{req.seeker_alias || `Anon_${req.user_id}`}</span>
                      <span className={[styles.urgencyBadge, styles.badge_moderate].join(' ')}>
                        <span className={styles.urgencyDot} />
                        {req.helper_type === 'therapist' ? 'Therapist Req.' : 'Peer Support'}
                      </span>
                      <span className={styles.slotBadge}>
                        {req.acceptance_count}/3 helpers
                      </span>
                    </div>
                    <button
                      className={styles.viewBriefBtn}
                      onClick={() => handleAccept(req.session_id)}
                      disabled={accepting === req.session_id}
                    >
                      {accepting === req.session_id ? 'Accepting…' : 'Accept ✓'}
                    </button>
                  </div>

                  <p className={styles.reqSnippet}>{req.message || 'No message provided.'}</p>

                  {req.categories?.length > 0 && (
                    <div className={styles.reqTags}>
                      {req.categories.map(c => (
                        <span key={c} className={styles.reqTag}>{c}</span>
                      ))}
                    </div>
                  )}

                  <p className={styles.reqTime}>
                    {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: My Sessions ── */}
        {tab === 'sessions' && (
          <div className={styles.tabContent}>
            <div className={styles.sessionList}>
              {mySessions.length === 0 && (
                <p className={styles.emptyState}>
                  You haven't accepted any sessions yet. Go to "All Requests" to accept one.
                </p>
              )}
              {mySessions.map((s) => (
                <div key={s.session_id} className={styles.sessionRow}>
                  <div className={styles.sessionLeft}>
                    <div className={styles.sessionAvatar}>U</div>
                    <div>
                      <p className={styles.sessionUserId}>{s.seeker_alias || `Anon_${s.user_id}`}</p>
                      <p className={styles.sessionDuration}>
                        {s.helper_type === 'therapist' ? 'Therapist session' : 'Peer session'}
                        {' · '}{s.acceptance_count}/3 helpers
                      </p>
                    </div>
                    {s.status === 'active' && <span className={styles.sessionOnlineDot} />}
                  </div>
                  <div className={styles.sessionSnippet}>"{s.message || 'No message'}"</div>
                  <button
                    className={styles.goToChatBtn}
                    onClick={() => navigate(`/helper/session/${s.session_id}`)}
                  >
                    💬 Go to Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
