import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import styles from './HelperDashboard.module.css';

const incomingRequests = [
  { id: 'r1', anonId: '4821', timeAgo: '2 min ago', status: 'URGENT', snippet: 'Feeling overwhelmed with work stress and sudden anxiety peaks during meetings.', tags: ['Work', 'Stress', 'Anxiety'] },
  { id: 'r2', anonId: '3342', timeAgo: '5 min ago', status: 'PENDING', snippet: 'Having trouble sleeping, mind keeps racing about family situation.', tags: ['Family', 'Sleep'] },
  { id: 'r3', anonId: '7751', timeAgo: '8 min ago', status: 'PENDING', snippet: 'Difficult relationship situation causing low mood throughout the day.', tags: ['Relationship', 'Stress', 'Anxiety'] },
];

const activeSessions = [
  { id: 's1', anonId: '1234', duration: '14 min' },
  { id: 's2', anonId: '5678', duration: '6 min' },
];

export default function HelperDashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        <div className={styles.statsBar}>
          <div className={styles.stat}><span className={styles.statValue}>3</span><span className={styles.statLabel}>Active Sessions</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statValue}>4.9 ★</span><span className={styles.statLabel}>Rating</span></div>
          <div className={styles.statDivider} />
          <div className={styles.stat}><span className={styles.statValue}>98%</span><span className={styles.statLabel}>Response Rate</span></div>
          <div className={styles.statDivider} />
          <div className={styles.statOnline}><span className={styles.onlineDot} />ONLINE NOW</div>
        </div>

        <div className={styles.content}>
          <div className={styles.left}>
            <h2 className={styles.sectionTitle}>Incoming Requests</h2>
            <div className={styles.requestList}>
              {incomingRequests.map(req => (
                <div key={req.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <span className={styles.reqAnon}>Anon #{req.anonId}</span>
                    <span className={styles.reqTime}>{req.timeAgo}</span>
                    <span className={[styles.reqStatus, req.status === 'URGENT' ? styles.urgent : styles.pending].join(' ')}>{req.status}</span>
                  </div>
                  <p className={styles.reqSnippet}>{req.snippet}</p>
                  <div className={styles.reqTags}>
                    {req.tags.map(t => <span key={t} className={styles.reqTag}>{t}</span>)}
                  </div>
                  <div className={styles.reqActions}>
                    <button className={styles.viewBriefBtn} onClick={() => navigate(`/helper/request/${req.id}`)}>View Brief</button>
                    <button className={styles.passBtn}>Pass</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.right}>
            <h2 className={styles.sectionTitle}>Active Sessions</h2>
            <div className={styles.sessionList}>
              {activeSessions.map(s => (
                <div key={s.id} className={styles.sessionCard} onClick={() => navigate(`/helper/session/${s.id}`)}>
                  <div className={styles.sessionInfo}>
                    <span className={styles.sessionAnon}>Anon #{s.anonId}</span>
                    <span className={styles.sessionDuration}>{s.duration}</span>
                  </div>
                  <span className={styles.sessionDot} />
                </div>
              ))}
            </div>
            <div className={styles.capacityCard}>
              <p className={styles.capacityText}>You have capacity for 1 more session.</p>
              <button className={styles.capacityBtn}>Continue →</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
