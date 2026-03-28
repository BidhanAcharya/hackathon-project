import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import styles from './AIChatPage.module.css';

const QUICK_REPLIES = ['My workload', 'A difficult meeting', 'Work-life balance', 'Something else'];

const initialMessages = [
  {
    id: 1,
    from: 'ai',
    text: "Thanks for sharing how you're feeling, Anon #4821. I'm here to listen. Based on our onboarding, it sounds like work stress has been a bit heavy lately. What's one thing that felt particularly challenging today?",
    time: '10:12 AM',
  },
];

export default function AIChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowQuickReplies(false);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'ai',
        text: "That sounds really tough. It's okay to feel overwhelmed — what you're experiencing is valid. Can you tell me more about what's been weighing on you most?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1500);
  };

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <div className={styles.chatPage}>
        <TopBar title="Talk to AI" subtitle="Your safe space for a quick check-in." />
        <div className={styles.chatArea}>
          <div className={styles.dateSep}>TODAY</div>

          {messages.map(msg => (
            <div key={msg.id} className={[styles.msgRow, msg.from === 'user' ? styles.userRow : styles.aiRow].join(' ')}>
              {msg.from === 'ai' && <div className={styles.aiAvatar}>AI</div>}
              <div className={[styles.bubble, msg.from === 'user' ? styles.userBubble : styles.aiBubble].join(' ')}>
                <p>{msg.text}</p>
                <span className={styles.time}>{msg.time}</span>
              </div>
              {msg.from === 'user' && <div className={styles.userAvatar} />}
            </div>
          ))}

          {showQuickReplies && (
            <div className={styles.quickReplies}>
              {QUICK_REPLIES.map(r => (
                <button key={r} className={styles.quickChip} onClick={() => sendMessage(r)}>{r}</button>
              ))}
            </div>
          )}

          {isTyping && (
            <div className={styles.msgRow}>
              <div className={styles.aiAvatar}>AI</div>
              <div className={styles.aiBubble}>
                <div className={styles.typing}><span /><span /><span /></div>
              </div>
            </div>
          )}

          <div className={styles.escalation} onClick={() => navigate('/professional-support')}>
            <div className={styles.escalationAvatar}>👤</div>
            <div>
              <p className={styles.escalationText}>Need a real person?</p>
              <p className={styles.escalationCta}>GET HUMAN HELP &gt;</p>
            </div>
          </div>

          <div ref={bottomRef} />
        </div>

        <div className={styles.inputBar}>
          <button className={styles.attachBtn}>+</button>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type your thoughts here..."
          />
          <button className={styles.sendBtn} onClick={() => sendMessage(input)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>SereneCare AI is here to support you, but it is not a clinical replacement for therapy or emergency services.</p>
      </div>
    </AppLayout>
  );
}
