import AppLayout from '../../components/layout/AppLayout';
import styles from './HelperHistoryPage.module.css';

const stats = [
  { label: 'Total Sessions', value: '142' },
  { label: 'Avg Rating', value: '4.9 ★' },
  { label: 'Response Rate', value: '98%' },
  { label: 'Impressed Rate', value: '91%' },
];

const history = [
  {
    id: 'h1',
    anonId: '9921',
    date: 'Mar 27, 2026',
    duration: '48 min',
    tags: ['Work Stress', 'Anxiety'],
    rating: 5,
    feedback: 'impressed',
    feedbackNote: 'The helper was incredibly patient and the breathing exercise actually helped. Felt heard.',
  },
  {
    id: 'h2',
    anonId: '3342',
    date: 'Mar 26, 2026',
    duration: '31 min',
    tags: ['Sleep', 'Lifestyle'],
    rating: 4,
    feedback: 'impressed',
    feedbackNote: "Good session. Would have liked more specific sleep routine advice, but overall felt supported.",
  },
  {
    id: 'h3',
    anonId: '7751',
    date: 'Mar 25, 2026',
    duration: '22 min',
    tags: ['Relationship', 'Stress'],
    rating: 3,
    feedback: 'neutral',
    feedbackNote: "Session was okay. Felt a little rushed toward the end.",
  },
  {
    id: 'h4',
    anonId: '1042',
    date: 'Mar 24, 2026',
    duration: '55 min',
    tags: ['Family', 'Anxiety'],
    rating: 5,
    feedback: 'impressed',
    feedbackNote: "One of the best sessions I've had. Dr. Aris really understood what I was going through.",
  },
  {
    id: 'h5',
    anonId: '5510',
    date: 'Mar 23, 2026',
    duration: '18 min',
    tags: ['Work', 'Burnout'],
    rating: 2,
    feedback: 'not_impressed',
    feedbackNote: 'Felt like the session was too generic. Needed more personalised advice.',
  },
  {
    id: 'h6',
    anonId: '8834',
    date: 'Mar 22, 2026',
    duration: '40 min',
    tags: ['Wellness', 'Focus'],
    rating: 5,
    feedback: 'impressed',
    feedbackNote: 'Very calming and grounding. The mindfulness tips were super practical.',
  },
];

const FEEDBACK_CONFIG = {
  impressed: { label: 'Impressed', className: 'badgeImpressed' },
  neutral: { label: 'Neutral', className: 'badgeNeutral' },
  not_impressed: { label: 'Not Impressed', className: 'badgeNotImpressed' },
};

function StarRating({ value }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= value ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </div>
  );
}

export default function HelperHistoryPage() {
  return (
    <AppLayout role="helper">
      <div className={styles.page}>

        {/* Profile header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>DA</div>
            <span className={styles.onlineBadge} />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>Dr. Aris</h1>
            <p className={styles.profileRole}>Senior Lead Helper · Mental Health Support</p>
          </div>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          {stats.map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Section title */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Session History & Patient Feedback</h2>
          <span className={styles.count}>{history.length} sessions</span>
        </div>

        {/* History list */}
        <div className={styles.historyList}>
          {history.map(item => {
            const fb = FEEDBACK_CONFIG[item.feedback];
            return (
              <div key={item.id} className={styles.historyCard}>
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardMeta}>
                      <span className={styles.anonId}>Anon #{item.anonId}</span>
                      <span className={styles.metaDot} />
                      <span className={styles.date}>{item.date}</span>
                      <span className={styles.metaDot} />
                      <span className={styles.duration}>{item.duration}</span>
                    </div>
                    <div className={styles.tagRow}>
                      {item.tags.map(t => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <StarRating value={item.rating} />
                    <span className={[styles.feedbackBadge, styles[fb.className]].join(' ')}>
                      {fb.label}
                    </span>
                  </div>
                </div>
                <div className={styles.feedbackNote}>
                  <span className={styles.quoteIcon}>"</span>
                  {item.feedbackNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
