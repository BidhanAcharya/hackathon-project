import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { createWebSocketConnection, getWebSocketChatHistory, getHelpSessionDetail } from '../api/endpoints';
import styles from './SessionPage.module.css';

export default function SessionPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const bottomRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Fetch session detail (helper info, preferences)
  useEffect(() => {
    getHelpSessionDetail(sessionId)
      .then(data => setSessionData(data))
      .catch(err => console.error('Failed to fetch session detail:', err));
  }, [sessionId]);

  // Load chat history then connect WebSocket
  useEffect(() => {
    getWebSocketChatHistory(sessionId)
      .then(history => {
        const mapped = history.map(msg => ({
          id: msg.id,
          from: msg.role,
          text: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(mapped);
      })
      .catch(err => console.error('Failed to load chat history:', err));

    const ws = createWebSocketConnection(sessionId, 'user');
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: 'helper',
        text: event.data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const sendMessage = (text) => {
    if (!text.trim() || !wsRef.current) return;
    wsRef.current.send(text);
    setMessages(prev => [...prev, {
      id: Date.now(),
      from: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const prefs = sessionData?.preferences || {};
  const categories = prefs.categories || [];

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <div className={styles.sessionPage}>
        <div className={styles.pageTop}>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className={styles.topBar}>
            <div className={styles.sessionInfo}>
              <div className={styles.seekerDot} />
              <div>
                <span className={styles.sessionName}>
                  {prefs.helper_type === 'therapist' ? '🩺 Verified Therapist' : '🤝 Peer Supporter'}
                </span>
                <span className={styles.sessionRole}>
                  {connected ? '● Connected' : '○ Connecting...'}
                </span>
              </div>
            </div>
            {categories.length > 0 && (
              <div className={styles.focusTags}>
                {categories.map(c => <span key={c} className={styles.focusTag}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        <div className={styles.chatWrapper}>
          <div className={styles.chatArea}>
            <div className={styles.dateSep}>TODAY</div>
            {messages.length === 0 && connected && (
              <div className={styles.emptyState}>
                <p>You're connected. Start the conversation whenever you're ready. 💙</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={[styles.msgRow, msg.from === 'user' ? styles.userRow : styles.helperRow].join(' ')}>
                {msg.from === 'helper' && <div className={styles.helperAvatar}>H</div>}
                <div className={[styles.bubble, msg.from === 'user' ? styles.userBubble : styles.helperBubble].join(' ')}>
                  <p>{msg.text}</p>
                  <span className={styles.time}>{msg.time}</span>
                </div>
                {msg.from === 'user' && <div className={styles.userAvatar}>A</div>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className={styles.inputBar}>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Share what's on your mind..."
          />
          <button
            className={[styles.sendBtn, !input.trim() ? styles.sendBtnDisabled : ''].join(' ')}
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>SereneCare is here to support you, but is not a replacement for emergency services.</p>
      </div>
    </AppLayout>
  );
}
