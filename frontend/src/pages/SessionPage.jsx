import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getSession, getChatHistory, closeSession, submitFeedback } from '../api/helpRequest';
import styles from './SessionPage.module.css';

const WS_BASE = 'ws://localhost:8000';

// ── Feedback Modal ────────────────────────────────────────────────────────────

function FeedbackModal({ sessionId, accessToken, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating || !feedbackType) {
      setError('Please select a rating and a feeling.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitFeedback(sessionId, { rating, feedbackType, note }, accessToken);
      onDone();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.feedbackOverlay}>
      <div className={styles.feedbackModal}>
        <h2 className={styles.feedbackTitle}>How did the session go?</h2>
        <p className={styles.feedbackSub}>Your feedback is anonymous and helps helpers improve.</p>

        {/* Star rating */}
        <div className={styles.starRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              className={[styles.starBtn, n <= (hovered || rating) ? styles.starActive : ''].join(' ')}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>

        {/* Feeling chips */}
        <div className={styles.feelingRow}>
          {[
            { value: 'impressed', label: '😊 Impressed' },
            { value: 'neutral', label: '😐 Neutral' },
            { value: 'not_impressed', label: '😞 Not Impressed' },
          ].map(opt => (
            <button
              key={opt.value}
              className={[styles.feelingChip, feedbackType === opt.value ? styles.feelingActive : ''].join(' ')}
              onClick={() => setFeedbackType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Note */}
        <textarea
          className={styles.feedbackNote}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Share anything about your experience (optional)…"
          rows={3}
          maxLength={400}
        />

        {error && <p className={styles.feedbackError}>{error}</p>}

        <div className={styles.feedbackActions}>
          <button className={styles.skipBtn} onClick={onDone} disabled={submitting}>
            Skip
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Session Page ──────────────────────────────────────────────────────────────

export default function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Load session details + chat history
  useEffect(() => {
    if (!sessionId || !user?.accessToken) return;

    getSession(sessionId, user.accessToken).then(s => {
      setSession(s);
      // Closed + no feedback yet → prompt for feedback
      if (s.status === 'closed' && !s.has_feedback) {
        setShowFeedback(true);
      }
    }).catch(() => {});

    getChatHistory(sessionId).then(history => {
      setMessages(history.map(m => ({
        id: m.id,
        from: m.role,
        text: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })));
    }).catch(() => {});
  }, [sessionId, user?.accessToken]);

  // WebSocket
  useEffect(() => {
    if (!sessionId) return;
    const ws = new WebSocket(`${WS_BASE}/api/v1/websocket/chat/${sessionId}/user`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    };
    ws.onclose = () => { setConnected(false); clearInterval(timerRef.current); };
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        from: 'helper',
        text: event.data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    };

    return () => { ws.close(); clearInterval(timerRef.current); };
  }, [sessionId]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(text);
    setMessages(prev => [...prev, {
      id: Date.now(), from: 'user', text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const handleEndSession = async () => {
    if (ending) return;
    setEnding(true);
    try { await closeSession(sessionId, user.accessToken); } catch {}
    wsRef.current?.close();
    setShowFeedback(true); // show feedback before leaving
  };

  const handleFeedbackDone = () => navigate('/dashboard');

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Anonymous: show Helper #ID, never username
  const helperId = session?.accepted_helpers?.[0]?.helper_id ?? session?.helper?.helper_id;
  const helperLabel = helperId ? `Helper #${helperId}` : 'Helper';
  const helperRole = session?.helper_type === 'therapist' ? 'Verified Therapist' : 'Peer Supporter';
  const isClosed = session?.status === 'closed';

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <div className={styles.sessionPage}>
        <div className={styles.pageTop}>
          <button className={styles.backBtn} onClick={() => navigate('/professional-support')}>
            ← Back
          </button>
          <div className={styles.topBar}>
            <div className={styles.sessionInfo}>
              <span className={styles.sessionName}>
                {helperLabel}
                {connected && <span style={{ marginLeft: 6, fontSize: 10, color: '#22c55e' }}>● Live</span>}
                {isClosed && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--color-text-muted)' }}>● Ended</span>}
              </span>
              <span className={styles.sessionRole}>{helperRole}</span>
            </div>
            {session?.categories?.length > 0 && (
              <div className={styles.focusTags}>
                {session.categories.slice(0, 2).map(c => (
                  <span key={c} className={styles.focusTag}>{c}</span>
                ))}
              </div>
            )}
            <div className={styles.topBarRight}>
              {!isClosed && (
                <button
                  className={styles.donateBtn}
                  onClick={handleEndSession}
                  disabled={ending}
                  style={{ background: 'var(--color-alert-red-light)', color: 'var(--color-alert-red)' }}
                >
                  {ending ? 'Ending…' : '■ End Session'}
                </button>
              )}
              <span className={styles.timer}>{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>

        <div className={styles.chatWrapper}>
          <div className={styles.chatArea}>
            <div className={styles.dateSep}>TODAY</div>

            {messages.length === 0 && !isClosed && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
                {connected ? 'Connected. Send a message to start.' : 'Connecting to session…'}
              </p>
            )}
            {messages.length === 0 && isClosed && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
                This session has ended.
              </p>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={[styles.msgRow, msg.from === 'user' ? styles.userRow : styles.helperRow].join(' ')}>
                {msg.from !== 'user' && <div className={styles.helperAvatar} />}
                <div className={[styles.bubble, msg.from === 'user' ? styles.userBubble : styles.helperBubble].join(' ')}>
                  <p>{msg.text}</p>
                  <span className={styles.time}>{msg.time}</span>
                </div>
                {msg.from === 'user' && <div className={styles.userAvatar} />}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {!isClosed && (
          <div className={styles.inputBar}>
            <button className={styles.attachBtn}>+</button>
            <input
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message…"
              disabled={!connected}
            />
            <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim() || !connected}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {isClosed && !showFeedback && !session?.has_feedback && (
          <div style={{ padding: '12px 20px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
            <button
              className={styles.sendBtn}
              style={{ width: 'auto', padding: '10px 24px', borderRadius: 'var(--radius-pill)', fontSize: '13px', fontWeight: 700 }}
              onClick={() => setShowFeedback(true)}
            >
              Rate this session
            </button>
          </div>
        )}

        <p className={styles.disclaimer}>
          SereneCare is here to support you, but is not a replacement for emergency services.
        </p>
      </div>

      {showFeedback && (
        <FeedbackModal
          sessionId={sessionId}
          accessToken={user?.accessToken}
          onDone={handleFeedbackDone}
        />
      )}
    </AppLayout>
  );
}
