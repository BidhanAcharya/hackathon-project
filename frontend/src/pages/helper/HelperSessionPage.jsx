import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import styles from './HelperSessionPage.module.css';

const initialMessages = [
  { id: 1, from: 'seeker', text: "It's been a tough week at work, feeling a bit overwhelmed.", time: '10:10 AM' },
];

export default function HelperSessionPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'helper', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        <div className={styles.pageTop}>
          <button className={styles.backBtn} onClick={() => navigate('/helper/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className={styles.topBar}>
            <div>
              <p className={styles.sessionTitle}>Session with Anon #4821</p>
              <p className={styles.sessionTags}>Work Stress · Anxiety</p>
            </div>
            <button className={styles.endBtn} onClick={() => navigate('/helper/dashboard')}>End Session</button>
          </div>
        </div>

        <div className={styles.chatArea}>
          <div className={styles.dateSep}>TODAY</div>
          {messages.map(msg => (
            <div key={msg.id} className={[styles.msgRow, msg.from === 'helper' ? styles.helperRow : styles.seekerRow].join(' ')}>
              {msg.from === 'seeker' && <div className={styles.seekerAvatar} />}
              <div className={[styles.bubble, msg.from === 'helper' ? styles.helperBubble : styles.seekerBubble].join(' ')}>
                <p>{msg.text}</p>
                <span className={styles.time}>{msg.time}</span>
              </div>
              {msg.from === 'helper' && <div className={styles.helperAvatar} />}
            </div>
          ))}
          <div ref={bottomRef} />
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
      </div>
    </AppLayout>
  );
}
