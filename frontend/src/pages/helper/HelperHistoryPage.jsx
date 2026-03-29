import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getHelperHistory } from '../../api/helpRequest';
import styles from './HelperHistoryPage.module.css';

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

function timeAgo(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ROLE_LABEL = {
  peer: 'Peer Supporter',
  therapist: 'Verified Therapist',
};

export default function HelperHistoryPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(() => {
    if (!user?.accessToken) return;
    getHelperHistory(user.accessToken)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.accessToken]);

  // Initial load + live polling every 30 s so new closed sessions appear automatically
  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, [loadHistory]);

  const sessions = data?.sessions ?? [];
  const stats = data?.stats ?? {};

  const initials = (user?.username || 'H').slice(0, 2).toUpperCase();
  const helperRole = user?.helperRole || 'peer';
  const roleLabel = ROLE_LABEL[helperRole] || 'Helper';

  const displayStats = [
    { label: 'Total Sessions', value: stats.total ?? 0 },
    { label: 'Avg Rating', value: stats.avg_rating != null ? `${stats.avg_rating} ★` : '—' },
    { label: 'Response Rate', value: '—' },
    { label: 'Impressed Rate', value: stats.impressed_rate != null ? `${stats.impressed_rate}%` : '—' },
  ];

  return (
    <AppLayout role="helper">
      <div className={styles.page}>

        {/* Profile header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>{initials}</div>
            <span className={styles.onlineBadge} />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {user?.alias || `Helper #${user?.userId}`}
            </h1>
            <p className={styles.profileRole}>
              {user?.username} ·{' '}
              <span
                style={{
                  color: helperRole === 'therapist' ? '#0ea5e9' : '#6c63ff',
                  fontWeight: 600,
                }}
              >
                {helperRole === 'therapist' ? '🩺' : '🤝'} {roleLabel}
              </span>
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          {displayStats.map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{loading ? '…' : s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Section title */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Session History & Feedback</h2>
          <span className={styles.count}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
        </div>

        {loading && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading history…</p>
        )}

        {!loading && sessions.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', padding: '1rem 0' }}>
            No closed sessions yet. Your session history will appear here once sessions end.
          </p>
        )}

        {/* History list */}
        <div className={styles.historyList}>
          {sessions.map(item => {
            const fb = item.feedback ? FEEDBACK_CONFIG[item.feedback.feedback_type] : null;
            return (
              <div key={item.session_id} className={styles.historyCard}>
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    <div className={styles.cardMeta}>
                      <span className={styles.anonId}>
                        {item.seeker_alias || `Anon_${item.user_id}`}
                      </span>
                      <span className={styles.metaDot} />
                      <span className={styles.date}>{timeAgo(item.created_at)}</span>
                      <span className={styles.metaDot} />
                      <span className={styles.duration}>
                        {item.helper_type === 'therapist' ? '🩺 Therapist' : '🤝 Peer'}
                      </span>
                    </div>
                    {item.categories?.length > 0 && (
                      <div className={styles.tagRow}>
                        {item.categories.map(t => (
                          <span key={t} className={styles.tag}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardRight}>
                    {item.feedback ? (
                      <>
                        <StarRating value={item.feedback.rating} />
                        <span className={[styles.feedbackBadge, styles[fb.className]].join(' ')}>
                          {fb.label}
                        </span>
                      </>
                    ) : (
                      <span className={[styles.feedbackBadge, styles.badgeNeutral].join(' ')}>
                        No feedback
                      </span>
                    )}
                  </div>
                </div>
                {item.feedback?.note && (
                  <div className={styles.feedbackNote}>
                    <span className={styles.quoteIcon}>"</span>
                    {item.feedback.note}
                  </div>
                )}
                {!item.feedback && (
                  <div className={styles.feedbackNote} style={{ color: 'var(--color-text-muted)', fontStyle: 'normal' }}>
                    The seeker did not leave feedback for this session.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
