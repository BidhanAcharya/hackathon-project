import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import styles from './SessionPage.module.css';

const initialMessages = [
  { id: 1, from: 'helper', text: "Thanks for sharing how you're feeling, Anon #4821. I'm here to listen and support you through this.", time: '10:00 AM' },
];

const SESSION_GOALS = [
  { id: 1, text: 'Identify emotional triggers', done: false },
  { id: 2, text: 'Practice self-compassion', done: false },
  { id: 3, text: 'Set healthy boundaries', done: false },
];

export default function SessionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [goals, setGoals] = useState(SESSION_GOALS);
  const [showGoals, setShowGoals] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'helper',
        text: "I hear you. That sounds really difficult. Let's take a moment to breathe — you're safe here.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1800);
  };

  const toggleGoal = (id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <div className={styles.sessionPage}>
        <div className={styles.pageTop}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className={styles.topBar}>
          <div className={styles.sessionInfo}>
            <span className={styles.sessionName}>Serene Curator</span>
            <span className={styles.sessionRole}>Licensed Therapist</span>
          </div>
          <div className={styles.focusTags}>
            <span className={styles.focusTag}>Work Stress</span>
            <span className={styles.focusTag}>Anxiety</span>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.donateBtn}>● Donate</button>
            <span className={styles.timer}>12:34</span>
          </div>
          </div>
        </div>

        <div className={styles.chatWrapper}>
          <div className={styles.chatArea}>
            <div className={styles.dateSep}>TODAY</div>
            {messages.map(msg => (
              <div key={msg.id} className={[styles.msgRow, msg.from === 'user' ? styles.userRow : styles.helperRow].join(' ')}>
                {msg.from === 'helper' && <div className={styles.helperAvatar} />}
                <div className={[styles.bubble, msg.from === 'user' ? styles.userBubble : styles.helperBubble].join(' ')}>
                  <p>{msg.text}</p>
                  <span className={styles.time}>{msg.time}</span>
                </div>
                {msg.from === 'user' && <div className={styles.userAvatar} />}
              </div>
            ))}
            {isTyping && (
              <div className={styles.msgRow}>
                <div className={styles.helperAvatar} />
                <div className={styles.helperBubble}>
                  <div className={styles.typing}><span /><span /><span /></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showGoals && (
            <div className={styles.goalsPanel}>
              <div className={styles.goalsPanelHeader}>
                <span>Session Goals</span>
                <button onClick={() => setShowGoals(false)}>×</button>
              </div>
              <div className={styles.goalsList}>
                {goals.map(g => (
                  <label key={g.id} className={styles.goalItem}>
                    <input type="checkbox" checked={g.done} onChange={() => toggleGoal(g.id)} />
                    <span className={g.done ? styles.goalDone : ''}>{g.text}</span>
                  </label>
                ))}
              </div>
              <div className={styles.energySection}>
                <p className={styles.energyLabel}>ENERGY LEVEL</p>
                <input type="range" min={0} max={100} defaultValue={60} className={styles.energySlider} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputBar}>
          <button className={styles.attachBtn}>+</button>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type a supportive message..."
          />
          <button className={styles.sendBtn} onClick={() => sendMessage(input)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>SereneCare AI is here to support you, but it is not a clinical replacement for therapy or emergency services.</p>
      </div>
    </AppLayout>
  );
}
