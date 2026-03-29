import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { requestHelp, analyzeConversation, getMyRequests } from '../api/endpoints';
import styles from './ProfessionalSupportPage.module.css';

const CATEGORIES = [
  { label: 'Anxiety', icon: '🌀' },
  { label: 'Work Stress', icon: '💼' },
  { label: 'Relationships', icon: '❤️' },
  { label: 'Sleep', icon: '🌙' },
  { label: 'Grief', icon: '🕊️' },
  { label: 'Career', icon: '🎯' },
  { label: 'Self-esteem', icon: '🌱' },
  { label: 'Other', icon: '💬' },
];

const STATUS_LABELS = {
  pending: { label: 'Pending', color: '#f59e0b' },
  active: { label: 'Active', color: '#22c55e' },
  closed: { label: 'Closed', color: '#6b7280' },
};

function RequestItem({ req, onSession }) {
  const [expanded, setExpanded] = useState(true);
  const prefs = req.preferences || {};
  const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.pending;

  return (
    <div className={styles.requestItem}>
      <div className={styles.requestItemHeader} onClick={() => setExpanded(p => !p)}>
        <div className={styles.requestItemLeft}>
          <span className={[styles.typePill, prefs.helper_type === 'therapist' ? styles.typePillTherapist : ''].join(' ')}>
            {prefs.helper_type === 'therapist' ? '🩺 Therapist' : '🤝 Peer'}
          </span>
          <div className={styles.requestItemMeta}>
            <p className={styles.requestItemMessage}>"{prefs.message || 'No message provided'}"</p>
            <div className={styles.requestItemCategories}>
              {(prefs.categories || []).map(c => <span key={c} className={styles.reqCatChip}>{c}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.requestItemRight}>
          <span className={styles.requestItemTime}>{new Date(req.created_at).toLocaleString()}</span>
          <span style={{ color: statusInfo.color, fontWeight: 600, fontSize: '0.75rem' }}>
            ● {statusInfo.label}
          </span>
          {req.status === 'active' && (
            <button
              className={styles.sessionBtn || styles.sendBtn}
              onClick={(e) => { e.stopPropagation(); onSession(req.session_id); }}
            >
              ▶ Open Session
            </button>
          )}
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div className={styles.responseGrid}>
          {req.status === 'pending' && (
            <p className={styles.waitingText}>⏳ Waiting for a helper to accept your request...</p>
          )}
          {req.status === 'active' && (
            <p style={{ padding: '12px', color: 'var(--color-text-muted)' }}>
              ✅ A helper has accepted. Click "Open Session" to start chatting.
            </p>
          )}
          {req.status === 'closed' && (
            <p style={{ padding: '12px', color: 'var(--color-text-muted)' }}>Session closed.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ComposeForm({ onSend, isDrawer, sending = false, error = null }) {
  const [helperType, setHelperType] = useState('peer');
  const [message, setMessage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (label) =>
    setSelectedCategories(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    );

  const handleSend = () => {
    if (!message.trim() || sending) return;
    onSend({ helperType, message, categories: selectedCategories });
  };

  return (
    <div className={[styles.composeForm, isDrawer ? styles.composeFormDrawer : ''].join(' ')}>
      {!isDrawer && (
        <div className={styles.formIntro}>
          <h2 className={styles.formTitle}>How can we help you today?</h2>
          <p className={styles.formSub}>Share what's on your mind — you're safe here.</p>
        </div>
      )}

      <div className={styles.privacyNote}>
        🔒 Completely anonymous. Helpers only see your non-identifying brief.
      </div>

      {/* Step 1 */}
      <div className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNum}>1</span> Who would you like to talk to?
        </div>
        <div className={styles.toggle}>
          <button className={[styles.toggleBtn, helperType === 'peer' ? styles.toggleActive : ''].join(' ')} onClick={() => setHelperType('peer')}>
            🤝 Peer Supporter
          </button>
          <button className={[styles.toggleBtn, helperType === 'therapist' ? styles.toggleActive : ''].join(' ')} onClick={() => setHelperType('therapist')}>
            🩺 Verified Therapist
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNum}>2</span> What area does this relate to?
          <span className={styles.labelHint}> — pick all that apply</span>
        </div>
        <div className={styles.categories}>
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              className={[styles.catChip, selectedCategories.includes(c.label) ? styles.catActive : ''].join(' ')}
              onClick={() => toggleCategory(c.label)}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 */}
      <div className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNum}>3</span> Tell us what's going on
        </div>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="You don't have to have it all figured out. Just share whatever feels right..."
          maxLength={500}
          rows={5}
        />
        <span className={styles.charCount}>{message.length} / 500</span>
      </div>

      <button
        className={[styles.sendBtn, (!message.trim() || sending) ? styles.sendBtnDisabled : ''].join(' ')}
        onClick={handleSend}
        disabled={!message.trim() || sending}
      >
        {sending ? 'Sending...' : 'Send to Helpers ▶'}
      </button>
      {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>{error}</p>}
      <div className={styles.responseTime}>⚡ AVERAGE RESPONSE TIME: UNDER 10 MINUTES</div>
    </div>
  );
}

export default function ProfessionalSupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyRequests()
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load requests:', err))
      .finally(() => setLoading(false));
  }, []);

  const isFirstTime = !loading && requests.length === 0;

  const handleSend = async ({ helperType, message, categories }) => {
    setSending(true);
    setError(null);
    try {
      // Analyze message to get domain
      const { domain } = await analyzeConversation(message);
      const preferences = { helper_type: helperType, categories, message };
      await requestHelp(domain, user.userId, preferences);
      // Refresh requests list
      const data = await getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
      setDrawerOpen(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSession = (sessionId) => navigate(`/session/${sessionId}`);

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <TopBar title="Get Support" />

      <div className={styles.page}>

        {isFirstTime ? (
          /* ── First time: show form inline ── */
          <div className={styles.firstTimeLayout}>
            <ComposeForm onSend={handleSend} isDrawer={false} sending={sending} error={error} />
            <div className={styles.trustSidebar}>
              <p className={styles.previewLabel}>WHY IT'S SAFE</p>
              <div className={styles.trustCard}>
                <div className={styles.trustAvatar} />
                <div>
                  <p className={styles.trustTitle}>Verified Helpers Only</p>
                  <p className={styles.trustDesc}>All peer supporters are trained and verified. Therapists are board-certified professionals.</p>
                </div>
              </div>
              <div className={styles.statsList}>
                <div className={styles.statItem}><span className={styles.statNum}>98%</span><span className={styles.statLabel}>Response rate</span></div>
                <div className={styles.statItem}><span className={styles.statNum}>&lt;10m</span><span className={styles.statLabel}>Avg response time</span></div>
                <div className={styles.statItem}><span className={styles.statNum}>100%</span><span className={styles.statLabel}>Anonymous</span></div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Has requests: list view ── */
          <>
            <div className={styles.listHeader}>
              <div>
                <h2 className={styles.listTitle}>Your Requests</h2>
                <p className={styles.listSub}>{requests.length} request{requests.length !== 1 ? 's' : ''} sent</p>
              </div>
              <button className={styles.newRequestBtn} onClick={() => setDrawerOpen(true)}>
                + New Request
              </button>
            </div>

            <div className={styles.requestList}>
              {loading ? (
                <p style={{ color: 'var(--color-text-muted)', padding: '16px' }}>Loading...</p>
              ) : (
                requests.map(req => (
                  <RequestItem key={req.session_id} req={req} onSession={handleSession} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Right drawer ── */}
      {drawerOpen && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className={styles.drawerTitle}>New Support Request</h3>
                <p className={styles.drawerSub}>We'll notify available helpers right away.</p>
              </div>
              <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <div className={styles.drawerBody}>
              <ComposeForm onSend={handleSend} isDrawer sending={sending} error={error} />
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
