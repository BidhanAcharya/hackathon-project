import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { createChatSession, sendChatMessage, getSessionHistory, getErrorMessage } from '../api/endpoints';
import styles from './AIChatPage.module.css';

const QUICK_REPLIES = [
  'My workload is overwhelming',
  'A difficult conversation',
  'Trouble sleeping',
  'Feeling anxious',
  'Something else',
];

const INITIAL_MESSAGE = {
  id: 1,
  from: 'ai',
  text: "Hi there. I'm glad you're here. Based on what you shared during onboarding, it sounds like things have felt heavy lately. You don't have to carry that alone. What's been on your mind most today?",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function AIChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Load existing session or create new one
  useEffect(() => {
    const initSession = async () => {
      const existingSessionId = searchParams.get('session');
      
      if (existingSessionId) {
        // Load existing session
        setSessionId(existingSessionId);
        try {
          const data = await getSessionHistory(existingSessionId);
          if (data.messages && data.messages.length > 0) {
            const loadedMessages = data.messages.map((msg, index) => ({
              id: index + 1,
              from: msg.role === 'user' ? 'user' : 'ai',
              text: msg.content,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));
            setMessages(loadedMessages);
            setShowQuickReplies(false);
          }
        } catch (err) {
          console.error('Failed to load session:', err);
          setError('Failed to load chat history');
        }
      }
    };

    if (isAuthenticated) {
      initSession();
    }
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping || isCreatingSession) return;
    
    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowQuickReplies(false);
    setIsTyping(true);
    inputRef.current?.focus();

    try {
      let currentSessionId = sessionId;
      
      // Create session if doesn't exist
      if (!currentSessionId) {
        setIsCreatingSession(true);
        const sessionData = await createChatSession(text.trim());
        currentSessionId = sessionData.session_id;
        setSessionId(currentSessionId);
        setIsCreatingSession(false);
        // Update URL to include session ID (without full reload)
        navigate(`/chat?session=${currentSessionId}`, { replace: true });
      }

      // Send message to API
      const response = await sendChatMessage(currentSessionId, text.trim());
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'ai',
        text: response.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setIsTyping(false);
      setIsCreatingSession(false);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    }
  }, [sessionId, isTyping, isCreatingSession]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <div className={styles.chatPage}>

        {/* Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <div className={styles.aiAvatarLg}>🧠</div>
            <div>
              <p className={styles.aiName}>Gunaso AI</p>
              <p className={styles.aiStatus}>
                <span className={styles.statusDot} />
                Always here for you
              </p>
            </div>
          </div>
          <button className={styles.humanHelpBtn} onClick={() => navigate('/professional-support')}>
            🤝 Get Human Help
          </button>
        </div>

        {/* Messages */}
        <div className={styles.chatArea}>
          <div className={styles.dateSep}>{formatDate()}</div>

          {messages.map(msg => (
            <div
              key={msg.id}
              className={[styles.msgRow, msg.from === 'user' ? styles.userRow : styles.aiRow].join(' ')}
            >
              {msg.from === 'ai' && (
                <div className={styles.aiAvatar}>🧠</div>
              )}
              <div className={[styles.bubble, msg.from === 'user' ? styles.userBubble : styles.aiBubble].join(' ')}>
                <p className={styles.bubbleText}>{msg.text}</p>
                <span className={styles.time}>{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Quick replies */}
          {showQuickReplies && (
            <div className={styles.quickSection}>
              <p className={styles.quickLabel}>Quick replies</p>
              <div className={styles.quickReplies}>
                {QUICK_REPLIES.map(r => (
                  <button key={r} className={styles.quickChip} onClick={() => sendMessage(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className={styles.msgRow}>
              <div className={styles.aiAvatar}>🧠</div>
              <div className={styles.aiBubble}>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className={styles.inputSection}>
          <div className={styles.inputBar}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind…"
              rows={1}
            />
            <button
              className={[styles.sendBtn, input.trim() ? styles.sendBtnActive : ''].join(' ')}
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <p className={styles.disclaimer}>
            Gunaso AI provides emotional support — not clinical advice. In a crisis, call a helpline.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
