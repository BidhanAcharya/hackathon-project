import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getSession, getChatHistory, closeSession } from '../../api/helpRequest';
import styles from './HelperSessionPage.module.css';

const WS_BASE = 'ws://localhost:8000';

function BriefDrawer({ session, onClose }) {
  const message = session?.message || 'No message provided.';
  const helperType = session?.helper_type === 'therapist' ? 'Therapist Request' : 'Peer Support';

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerUrgency}>
              <span className={styles.urgencyDot} />
              <span className={styles.urgencyLabel}>{helperType}</span>
            </div>
            <h3 className={styles.drawerTitle}>Request Brief — User #{session?.user_id}</h3>
            <div className={styles.drawerTags}>
              <span className={styles.tag}>{session?.helper_type === 'therapist' ? 'Therapist' : 'Peer'}</span>
              {session?.acceptance_count > 0 && (
                <span className={styles.tag}>{session.acceptance_count}/3 helpers</span>
              )}
            </div>
          </div>
          <button className={styles.drawerClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.briefSection}>
            <p className={styles.sectionLabel}>What they shared</p>
            <p className={styles.summaryQuote}>"{message}"</p>
          </div>

          <div className={styles.briefSection}>
            <div className={styles.needsHeader}>
              <span className={styles.needsIcon}>🧠</span>
              <p className={styles.sectionLabel} style={{ margin: 0 }}>How to help</p>
            </div>
            <div className={styles.needsList}>
              <div className={styles.needItem}>
                <div className={styles.needNumber}>1</div>
                <div>
                  <p className={styles.needItemTitle}>Active listening</p>
                  <p className={styles.needItemText}>Acknowledge their feelings without judgment. Let them feel heard first.</p>
                </div>
              </div>
              <div className={styles.needItem}>
                <div className={styles.needNumber}>2</div>
                <div>
                  <p className={styles.needItemTitle}>Grounding techniques</p>
                  <p className={styles.needItemText}>If they seem overwhelmed, try a simple breathing or grounding exercise.</p>
                </div>
              </div>
              <div className={styles.needItem}>
                <div className={styles.needNumber}>3</div>
                <div>
                  <p className={styles.needItemTitle}>Safe space</p>
                  <p className={styles.needItemText}>Maintain a non-judgmental environment throughout the conversation.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.warningBanner}>
            <div className={styles.warningIcon}>⚠</div>
            <div>
              <p className={styles.warningTitle}>Critical Reminder</p>
              <p className={styles.warningText}>Escalate if you detect crisis signals or self-harm ideation during the session.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HelperSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [ending, setEnding] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load session details + chat history
  useEffect(() => {
    if (!sessionId || !user?.accessToken) return;

    getSession(sessionId, user.accessToken)
      .then(s => setSession(s))
      .catch(() => {});

    getChatHistory(sessionId)
      .then(history => {
        setMessages(history.map(m => ({
          id: m.id,
          from: m.role,   // 'user' | 'helper'
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      })
      .catch(() => {});
  }, [sessionId, user?.accessToken]);

  // WebSocket connection
  useEffect(() => {
    if (!sessionId) return;
    const ws = new WebSocket(`${WS_BASE}/api/v1/websocket/chat/${sessionId}/helper`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: 'user',
        text: event.data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    };

    return () => ws.close();
  }, [sessionId]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(text);
    }
    setMessages(prev => [...prev, {
      id: Date.now(),
      from: 'helper',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const handleEndSession = async () => {
    if (ending) return;
    setEnding(true);
    try {
      await closeSession(sessionId, user.accessToken);
    } catch {}
    wsRef.current?.close();
    navigate('/helper/dashboard');
  };

  const isClosed = session?.status === 'closed';

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
              <div className={styles.seekerDot} style={{ background: connected ? '#22c55e' : isClosed ? 'var(--color-text-muted)' : '#f59e0b' }} />
              <div>
                <p className={styles.sessionTitle}>
                  Session with User #{session?.user_id || '…'}
                  {connected && <span style={{ marginLeft: 8, fontSize: 10, color: '#22c55e' }}>● Live</span>}
                  {isClosed && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--color-text-muted)' }}>● Ended</span>}
                </p>
                <p className={styles.sessionTags}>
                  {session?.helper_type === 'therapist' ? 'Therapist Request' : 'Peer Support'}
                  {session?.acceptance_count != null && ` · ${session.acceptance_count}/3 helpers`}
                </p>
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
              {!isClosed && (
                <button
                  className={styles.endBtn}
                  onClick={handleEndSession}
                  disabled={ending}
                >
                  {ending ? 'Ending…' : 'End Session'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className={styles.chatArea}>
          <div className={styles.dateSep}>TODAY</div>

          {messages.length === 0 && !isClosed && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
              {connected ? 'Connected. Waiting for the seeker…' : 'Connecting to session…'}
            </p>
          )}

          {messages.length === 0 && isClosed && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
              This session has ended.
            </p>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={[styles.msgRow, msg.from === 'helper' ? styles.helperRow : styles.seekerRow].join(' ')}
            >
              {msg.from === 'user' && (
                <div className={styles.seekerAvatar}>
                  {String(session?.user_id || 'A')[0].toUpperCase()}
                </div>
              )}
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
        {!isClosed && (
          <div className={styles.inputBar}>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a supportive message…"
              disabled={!connected}
            />
            <button
              className={[styles.sendBtn, (!input.trim() || !connected) ? styles.sendBtnDisabled : ''].join(' ')}
              onClick={sendMessage}
              disabled={!input.trim() || !connected}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {briefOpen && <BriefDrawer session={session} onClose={() => setBriefOpen(false)} />}
    </AppLayout>
  );
}
