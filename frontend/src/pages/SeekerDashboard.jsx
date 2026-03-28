import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import styles from './SeekerDashboard.module.css';

const acceptedHelpers = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    expertise: 'Anxiety & Depression',
    experience: '9 years',
    hasMessage: false,
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    expertise: 'Relationship Counseling',
    experience: '6 years',
    hasMessage: true,
  },
  {
    id: 3,
    name: 'Dr. Nadia Kapoor',
    expertise: 'Stress & Burnout',
    experience: '11 years',
    hasMessage: false,
  },
];

function TalkToAICard({ onStart }) {
  return (
    <div className={styles.aiCard}>
      <div className={styles.aiCardIcon}>🧠</div>
      <div className={styles.aiCardBody}>
        <h3 className={styles.aiCardTitle}>Talk to AI</h3>
        <p className={styles.aiCardDesc}>
          Our clinically-trained AI is ready to listen and guide you through your thoughts in a safe space.
        </p>
      </div>
      <button className={styles.aiCardBtn} onClick={onStart}>START CONVERSATION</button>
    </div>
  );
}

function HelperCard({ helper, onAction }) {
  return (
    <div className={styles.helperCard}>
      <div className={styles.helperCardAvatar} />
      <div className={styles.helperCardInfo}>
        <p className={styles.helperCardName}>{helper.name}</p>
        <p className={styles.helperCardExpertise}>{helper.expertise}</p>
        <p className={styles.helperCardExp}>{helper.experience} experience</p>
      </div>
      <button
        className={helper.hasMessage ? styles.helperCardBtnContinue : styles.helperCardBtnStart}
        onClick={() => onAction(helper.id)}
      >
        {helper.hasMessage ? 'Continue' : 'Start Session'}
      </button>
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

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <TopBar title="Home" subtitle="Your mental health companion" />
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingTitle}>Welcome back, <span className={styles.greetingAnon}>Anon #{user?.anonId ?? '4821'}</span></h1>
            <p className={styles.greetingSubtitle}>Your journey to mental clarity continues. How are you feeling today?</p>
          </div>

          <TalkToAICard onStart={() => navigate('/chat')} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Your Accepted Helpers</h2>
              <button className={styles.viewAll} onClick={() => navigate('/professional-support')}>
                View All →
              </button>
            </div>
            <div className={styles.helperList}>
              {acceptedHelpers.map(h => (
                <HelperCard
                  key={h.id}
                  helper={h}
                  onAction={(id) => navigate(`/session/${id}`)}
                />
              ))}
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
