import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import styles from './SeekerDashboard.module.css';

const recentConversations = [
  { id: 1, title: 'Anxiety Management at Work', date: 'Today' },
  { id: 2, title: 'Communication Breakdown', date: 'Yesterday' },
  { id: 3, title: 'Sleep Issues', date: '3 days ago' },
];

function TalkToAICard({ onStart }) {
  return (
    <div className={styles.aiCard}>
      <div className={styles.aiCardIcon}>🤖</div>
      <div>
        <h3 className={styles.aiCardTitle}>Talk to AI</h3>
        <p className={styles.aiCardDesc}>Our AI is ready to listen and guide you through your thoughts safely.</p>
      </div>
      <button className={styles.aiCardBtn} onClick={onStart}>Start conversation →</button>
    </div>
  );
}

function GetHelpWidget({ onGetHelp }) {
  return (
    <div className={styles.helpWidget}>
      <div className={styles.helpWidgetHeader}>
        <div className={styles.helperMini}>
          <div className={styles.helperAvatar} />
          <div>
            <p className={styles.helperName}>Dr. Aris</p>
            <span className={styles.helperBadge}>Professional Support</span>
          </div>
        </div>
      </div>
      <button className={styles.helpBtn} onClick={onGetHelp}>Get Help</button>
      <p className={styles.helpOr}>Or ask address</p>
    </div>
  );
}

function StreakCard() {
  return (
    <div className={styles.streakCard}>
      <p className={styles.streakLabel}>7-Day Consistency</p>
      <div className={styles.streakRing}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-seeker-green)" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 34 * 0.7} ${2 * Math.PI * 34 * 0.3}`}
            strokeDashoffset={2 * Math.PI * 34 * 0.25}
            strokeLinecap="round" />
        </svg>
        <span className={styles.streakPct}>70%</span>
      </div>
      <p className={styles.streakMotivation}>Keep going — you're building a healthy habit!</p>
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
            <h1 className={styles.greetingTitle}>Welcome back, companion.</h1>
            <p className={styles.greetingSubtitle}>Your mental health is our priority. How are you feeling today?</p>
          </div>

          <TalkToAICard onStart={() => navigate('/chat')} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Conversations</h2>
              <button className={styles.viewAll} onClick={() => navigate('/chat/history')}>View All Sessions →</button>
            </div>
            <div className={styles.convList}>
              {recentConversations.map(c => (
                <div key={c.id} className={styles.convItem} onClick={() => navigate(`/chat?session=${c.id}`)}>
                  <span className={styles.convTitle}>{c.title}</span>
                  <span className={styles.convDate}>{c.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <GetHelpWidget onGetHelp={() => navigate('/professional-support')} />
          <StreakCard />
        </div>
      </div>
    </AppLayout>
  );
}
