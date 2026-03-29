import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { createWebSocketConnection, getWebSocketChatHistory, getHelpSessionDetail, closeHelpSession } from '../../api/endpoints';
import styles from './HelperSessionPage.module.css';

function BriefDrawer({ sessionData, onClose }) {
  const assessment = sessionData?.initial_assessment;
  const prefs = sessionData?.preferences || {};
  const userId = sessionData?.user_id;
  const tags = assessment?.tags || assessment?.areas_of_concern || [];
  const categories = prefs.categories || [];

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerUrgency}>
              <span className={styles.urgencyDot} />
              <span className={styles.urgencyLabel}>{assessment?.severity || 'Pending'} Urgency</span>
            </div>
            <h3 className={styles.drawerTitle}>Request Brief — User #{userId || '...'}</h3>
            <div className={styles.drawerTags}>
              {tags.length > 0 ? tags.map((t, i) => (
                <span key={i} className={styles.tag}>{t}</span>
              )) : categories.length > 0 ? categories.map((c, i) => (
                <span key={i} className={styles.tag}>{c}</span>
              )) : <span className={styles.tag}>General</span>}
            </div>
          </div>
          <button className={styles.drawerClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.drawerBody}>
          {/* User's own request message */}
          {prefs.message && (
            <div className={styles.briefSection}>
              <p className={styles.sectionLabel}>User's Request</p>
              <p className={styles.summaryQuote} style={{ fontStyle: 'italic' }}>"{prefs.message}"</p>
              {prefs.helper_type && (
                <p style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Requested: {prefs.helper_type === 'therapist' ? '🩺 Verified Therapist' : '🤝 Peer Supporter'}
                </p>
              )}
            </div>
          )}
          <div className={styles.briefSection}>
            <p className={styles.sectionLabel}>AI Assessment Summary</p>
            <p className={styles.summaryQuote}>{assessment?.summary || assessment?.description || 'No assessment available.'}</p>
          </div>
          <div className={styles.warningBanner}>
            <div className={styles.warningIcon}>⚠</div>
            <div>
              <p className={styles.warningTitle}>Critical Clinical Reminder</p>
              <p className={styles.warningText}>Escalate if you detect crisis signals or self-harm ideation during the discourse.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HelperSessionPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Fetch session detail for the brief drawer
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

    const ws = createWebSocketConnection(sessionId, 'helper');
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: 'user',
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
      from: 'helper',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const handleEndSession = async () => {
    try {
      await closeHelpSession(sessionId);
    } catch (err) {
      console.error('Failed to close session:', err);
    }
    if (wsRef.current) wsRef.current.close();
    navigate('/helper/dashboard');
  };

  const userId = sessionData?.user_id;

  return (
    <AppLayout role="helper">
      <div className={styles.page}>
        {/* Top bar */}
        <div className={styles.pageTop}>
          <button className={styles.backBtn} onClick={() => navigate('/helper/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className={styles.topBar}>
            <div className={styles.sessionInfo}>
              <div className={styles.seekerDot} />
              <div>
                <p className={styles.sessionTitle}>Session with User #{userId || '...'}</p>
                <p className={styles.sessionTags}>{connected ? '● Connected' : '○ Disconnected'}</p>
              </div>
            </div>
            <div className={styles.topBarActions}>
              <button
                className={styles.infoBtn}
                onClick={() => setBriefOpen(true)}
                title="View request brief"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button className={styles.endBtn} onClick={handleEndSession}>
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className={styles.chatArea}>
          <div className={styles.dateSep}>TODAY</div>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={[styles.msgRow, msg.from === 'helper' ? styles.helperRow : styles.seekerRow].join(' ')}
            >
              {msg.from !== 'helper' && <div className={styles.seekerAvatar}>A</div>}
              <div className={[styles.bubble, msg.from === 'helper' ? styles.helperBubble : styles.seekerBubble].join(' ')}>
                <p>{msg.text}</p>
                <span className={styles.time}>{msg.time}</span>
              </div>
              {msg.from === 'helper' && <div className={styles.helperAvatar}>H</div>}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className={styles.inputBar}>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type a supportive message..."
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
      </div>

      {/* Brief drawer */}
      {briefOpen && <BriefDrawer sessionData={sessionData} onClose={() => setBriefOpen(false)} />}
    </AppLayout>
  );
}
