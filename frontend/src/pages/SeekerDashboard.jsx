import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { getMyRequests } from '../api/endpoints';
import styles from './SeekerDashboard.module.css';

function TalkToAICard({ onStart }) {
  return (
    <div className={styles.aiCard}>
      <div className={styles.aiCardIcon}>🧠</div>
      <div className={styles.aiCardBody}>
        <h3 className={styles.aiCardTitle}>Talk to AI</h3>
        <p className={styles.aiCardDesc}>
          Your personal AI companion — context-aware and tailored to your specific situation, ready to listen and guide you through what you're facing right now.
        </p>
      </div>
      <button className={styles.aiCardBtn} onClick={onStart}>START CONVERSATION</button>
    </div>
  );
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', dot: '⏳' },
  active: { label: 'Active — Ready to Chat', color: '#22c55e', dot: '✅' },
  closed: { label: 'Closed', color: '#6b7280', dot: '✓' },
};

function RequestCard({ req, onAction }) {
  const prefs = req.preferences || {};
  const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  return (
    <div className={styles.helperCard}>
      <div className={styles.helperCardAvatar} />
      <div className={styles.helperCardInfo}>
        <p className={styles.helperCardName}>
          {prefs.helper_type === 'therapist' ? '🩺 Therapist' : '🤝 Peer Supporter'}
        </p>
        <p className={styles.helperCardExpertise}>
          {(prefs.categories || []).join(', ') || 'General'}
        </p>
        <p className={styles.helperCardExp} style={{ color: status.color }}>
          {status.dot} {status.label}
        </p>
      </div>
      {req.status === 'active' && (
        <button className={styles.helperCardBtnContinue} onClick={() => onAction(req.session_id)}>
          Continue
        </button>
      )}
      {req.status === 'pending' && (
        <button className={styles.helperCardBtnStart} disabled style={{ opacity: 0.5 }}>
          Waiting...
        </button>
      )}
    </div>
  );
}

function GetHelpWidget({ onGetHelp, onHotline }) {
  return (
    <div className={styles.helpWidget}>
      <div className={styles.helpWidgetIcon}>
        <span>+</span>
      </div>
      <h3 className={styles.helpWidgetTitle}>Get Help</h3>
      <p className={styles.helpWidgetDesc}>
        Access clinical expertise or emergency support services curated for your needs.
      </p>
      <button className={styles.helpBtn} onClick={onGetHelp}>
        🤝 Professional Support →
      </button>
      <button className={styles.hotlineBtn} onClick={onHotline}>
        Crisis Hotline 📞
      </button>
    </div>
  );
}

function StreakCard() {
  return (
    <div className={styles.streakCard}>
      <p className={styles.streakNext}>NEXT MILESTONE</p>
      <h3 className={styles.streakTitle}>7-Day Consistency</h3>
      <p className={styles.streakDesc}>
        You're just 2 sessions away from earning your 'Zen Master' badge.
      </p>
      <div className={styles.streakRingWrap}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="var(--color-border)" strokeWidth="7" />
          <circle
            cx="36" cy="36" r="30" fill="none"
            stroke="var(--color-primary)" strokeWidth="7"
            strokeDasharray={`${2 * Math.PI * 30 * 0.7} ${2 * Math.PI * 30 * 0.3}`}
            strokeDashoffset={2 * Math.PI * 30 * 0.25}
            strokeLinecap="round"
          />
        </svg>
        <span className={styles.streakPct}>70%</span>
      </div>
    </div>
  );
}

export default function SeekerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    getMyRequests()
      .then(data => setMyRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load requests:', err));
  }, []);

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <TopBar title="Home" subtitle="Your mental health companion" />
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingTitle}>Welcome back, <span className={styles.greetingAnon}>{user?.username || 'Friend'}</span></h1>
            <p className={styles.greetingSubtitle}>Your journey to mental clarity continues. How are you feeling today?</p>
          </div>

          <TalkToAICard onStart={() => navigate('/chat')} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Your Help Requests</h2>
              <button className={styles.viewAll} onClick={() => navigate('/professional-support')}>
                View All →
              </button>
            </div>
            <div className={styles.helperList}>
              {myRequests.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  No requests yet. <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/professional-support')}>Get professional support →</button>
                </p>
              ) : (
                myRequests.slice(0, 3).map(req => (
                  <RequestCard
                    key={req.session_id}
                    req={req}
                    onAction={(sessionId) => navigate(`/session/${sessionId}`)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <GetHelpWidget
            onGetHelp={() => navigate('/professional-support')}
            onHotline={() => navigate('/emergency')}
          />
          <StreakCard />
        </div>
      </div>
    </AppLayout>
  );
}
