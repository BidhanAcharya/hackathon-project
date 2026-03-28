import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import styles from './HelperDashboard.module.css';

const incomingRequests = [
  {
    id: 'r1',
    anonId: '9921',
    timeAgo: 'Received 2m ago',
    urgency: 'high',
    urgencyLabel: 'High Urgency',
    snippet: 'Feeling overwhelmed with work stress and sudden anxiety peaks during meetings.',
    tags: ['Work', 'Stress', 'Anxiety'],
  },
  {
    id: 'r2',
    anonId: '1042',
    timeAgo: 'Received 14m ago',
    urgency: 'moderate',
    urgencyLabel: 'Moderate',
    snippet: 'Difficulties maintaining routine sleep hygiene, feeling lethargic.',
    tags: ['Sleep', 'Lifestyle'],
  },
  {
    id: 'r3',
    anonId: '8834',
    timeAgo: 'Received 45m ago',
    urgency: 'low',
    urgencyLabel: 'Low Urgency',
    snippet: 'Seeking general guidance on mindfulness techniques for daily focus.',
    tags: ['Wellness', 'Focus'],
  },
];

const activeSessions = [
  { id: 's1', userId: '88219', initials: 'JD', duration: 'Connected for 42m', snippet: '"Thank you for the breathing exercises, I feel a bit more..."' },
  { id: 's2', userId: '77120', initials: 'MK', duration: 'Connected for 1h 15m', snippet: '"I\'ll try to implement the schedule changes this weekend..."' },
  { id: 's3', userId: '90014', initials: 'PL', duration: 'Connected for 5m', snippet: '"Hello, I\'m just starting to look at the resources..."' },
];

export default function HelperDashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.welcomeTitle}>Welcome back, Dr. Aris</h1>
          <p className={styles.welcomeSub}>Your clinical overview for today.</p>
        </header>

        {/* Stat Cards */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active Sessions</p>
            <h3 className={styles.statValue}>12</h3>
            <div className={styles.statMeta + ' ' + styles.metaGreen}>
              <span className={styles.trendIcon}>↑</span> 2 more than yesterday
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
              <span className={styles.newBadge}>3 New Requests</span>
            </div>
            <div className={styles.requestList}>
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className={[styles.requestCard, styles[`urgency_${req.urgency}`]].join(' ')}
                >
                  <div className={styles.requestTop}>
                    <div className={styles.requestMeta}>
                      <span className={styles.reqAnon}>Anon #{req.anonId}</span>
                      <span className={[styles.urgencyBadge, styles[`badge_${req.urgency}`]].join(' ')}>
                        <span className={styles.urgencyDot} />
                        {req.urgencyLabel}
                      </span>
                    </div>
                    <button
                      className={styles.viewBriefBtn}
                      onClick={() => navigate(`/helper/request/${req.id}`)}
                    >
                      View Brief <span>›</span>
                    </button>
                  </div>
                  <p className={styles.reqSnippet}>{req.snippet}</p>
                  <div className={styles.reqTags}>
                    {req.tags.map((t) => (
                      <span key={t} className={styles.reqTag}>{t}</span>
                    ))}
                  </div>
                  <p className={styles.reqTime}>{req.timeAgo}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Active Sessions */}
          <section className={styles.sessionsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Sessions</h2>
              <button className={styles.viewAllLink}>View All Sessions</button>
            </div>
            <div className={styles.sessionList}>
              {activeSessions.map((s) => (
                <div key={s.id} className={styles.sessionRow}>
                  <div className={styles.sessionLeft}>
                    <div className={styles.sessionAvatar}>{s.initials}</div>
                    <div>
                      <p className={styles.sessionUserId}>User ID: #{s.userId}</p>
                      <p className={styles.sessionDuration}>{s.duration}</p>
                    </div>
                  </div>
                  <span className={styles.sessionOnlineDot} />
                  <div className={styles.sessionSnippet}>{s.snippet}</div>
                  <button
                    className={styles.goToChatBtn}
                    onClick={() => navigate(`/helper/session/${s.id}`)}
                  >
                    💬 Go to Chat
                  </button>
                </div>
              ))}
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
