import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import styles from './AIChatPage.module.css';

const QUICK_REPLIES = [
  'My workload is overwhelming',
  'A difficult conversation',
  'Trouble sleeping',
  'Feeling anxious',
  'Something else',
];

const initialMessages = [
  {
    id: 1,
    from: 'ai',
    text: "Hi there. I'm glad you're here. Based on what you shared during onboarding, it sounds like things have felt heavy lately. You don't have to carry that alone. What's been on your mind most today?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function AIChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
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

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'ai',
        text: "That sounds really tough, and it's completely valid to feel that way. Sometimes just naming what's going on is the first step. Can you tell me a little more about what's been weighing on you most?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <div className={styles.chatPage}>

        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <div className={styles.aiAvatarLg}>🧠</div>
            <div>
              <p className={styles.aiName}>Mental Wizard AI</p>
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
            Mental Wizard AI provides emotional support — not clinical advice. In a crisis, call a helpline.
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
