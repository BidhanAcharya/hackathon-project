import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import { createHelpRequest, getUserSessions, deleteHelpRequest } from '../api/helpRequest';
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

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function sessionToRequest(s) {
  const acceptedHelpers = s.accepted_helpers || (s.helper ? [s.helper] : []);
  return {
    id: s.session_id,
    helperType: s.helper_type || 'peer',
    message: s.message || '',
    categories: s.categories || [],
    time: timeAgo(s.created_at),
    status: s.status,
    waiting: s.status === 'pending' && acceptedHelpers.length === 0,
    acceptanceCount: s.acceptance_count || acceptedHelpers.length,
    canDelete: s.status === 'closed',
    responses: acceptedHelpers.map(h => ({
      id: `${s.session_id}-${h.helper_id}`,
      initials: (h.alias || `H${h.helper_id}`).slice(0, 2).toUpperCase(),
      name: h.alias || `Helper #${h.helper_id}`,
      role: (h.role === 'therapist' || s.helper_type === 'therapist') ? 'Verified Therapist' : 'Peer Supporter',
      expertise: h.domain_expertise || '',
      time: timeAgo(s.created_at),
      message: 'Ready to help. Click to open your session.',
      sessionId: s.session_id,
    })),
  };
}

function ResponseCard({ resp, onSession }) {
  return (
    <div className={styles.responseCard}>
      <div className={styles.respHeader}>
        <div className={styles.respAvatar}>{resp.initials}</div>
        <div className={styles.respMeta}>
          <span className={styles.respName}>{resp.name}</span>
          <span className={styles.respRole}>{resp.role}</span>
        </div>
        <span className={styles.respTime}>{resp.time}</span>
      </div>
      <p className={styles.respMessage}>{resp.message}</p>
      <button className={styles.sessionBtn} onClick={() => onSession(resp.sessionId)}>
        ▶ Open Session
      </button>
    </div>
  );
}

function RequestItem({ req, onSession, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this request? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete(req.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.requestItem}>
      <div className={styles.requestItemHeader} onClick={() => setExpanded(p => !p)}>
        <div className={styles.requestItemLeft}>
          <span className={[styles.typePill, req.helperType === 'therapist' ? styles.typePillTherapist : ''].join(' ')}>
            {req.helperType === 'peer' ? '🤝 Peer' : '🩺 Therapist'}
          </span>
          <div className={styles.requestItemMeta}>
            <p className={styles.requestItemMessage}>"{req.message}"</p>
            <div className={styles.requestItemCategories}>
              {req.categories.map(c => <span key={c} className={styles.reqCatChip}>{c}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.requestItemRight}>
          <span className={styles.requestItemTime}>{req.time}</span>
          {req.status === 'closed' ? (
            <span className={styles.responsesCount} style={{ color: '#22c55e' }}>✓ Completed</span>
          ) : (
            <span className={styles.responsesCount}>
              {req.waiting
                ? '⏳ Waiting for helpers…'
                : `${req.acceptanceCount}/3 helper${req.acceptanceCount !== 1 ? 's' : ''} ready`}
            </span>
          )}
          {req.canDelete && (
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleting}
              title="Delete this completed request"
            >
              {deleting ? '…' : '🗑'}
            </button>
          )}
          <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.responseGrid}>
          {req.responses.map(resp => (
            <ResponseCard key={resp.id} resp={resp} onSession={onSession} />
          ))}
          {req.responses.length === 0 && (
            <p className={styles.waitingText}>
              ⏳ Waiting for helpers to accept your request. Up to 3 helpers can join.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ComposeForm({ onSend, isDrawer, submitting, error }) {
  const [helperType, setHelperType] = useState('peer');
  const [message, setMessage] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (label) =>
    setSelectedCategories(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    );

  const handleSend = async () => {
    if (!message.trim() || submitting) return;
    const success = await onSend({ helperType, message, categories: selectedCategories });
    if (success) {
      setMessage('');
      setSelectedCategories([]);
      setHelperType('peer');
    }
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
          <button
            className={[styles.toggleBtn, helperType === 'peer' ? styles.toggleActive : ''].join(' ')}
            onClick={() => setHelperType('peer')}
          >
            🤝 Peer Supporter
          </button>
          <button
            className={[styles.toggleBtn, helperType === 'therapist' ? styles.toggleActive : ''].join(' ')}
            onClick={() => setHelperType('therapist')}
          >
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

      {error && <p className={styles.error}>{error}</p>}
      <button
        className={[styles.sendBtn, (!message.trim() || submitting) ? styles.sendBtnDisabled : ''].join(' ')}
        onClick={handleSend}
        disabled={!message.trim() || submitting}
      >
        {submitting ? 'Sending…' : 'Send to Helpers ▶'}
      </button>
      <div className={styles.responseTime}>⚡ AVERAGE RESPONSE TIME: UNDER 10 MINUTES</div>
    </div>
  );
}

export default function ProfessionalSupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load existing sessions on mount and periodically refresh
  const loadSessions = () => {
    if (!user?.accessToken) return;
    getUserSessions(user.accessToken)
      .then(sessions => {
        setRequests(sessions.map(sessionToRequest));
        setLoadingRequests(false);
      })
      .catch(() => setLoadingRequests(false));
  };

  useEffect(() => {
    loadSessions();
    // Poll every 15 seconds to catch helper assignments
    const interval = setInterval(loadSessions, 15000);
    return () => clearInterval(interval);
  }, [user?.accessToken]);

  const isFirstTime = !loadingRequests && requests.length === 0;

  // Returns true on success so ComposeForm can reset itself
  const handleSend = async ({ helperType, message, categories }) => {
    if (!user?.accessToken) return false;
    setSubmitting(true);
    setError('');
    try {
      const result = await createHelpRequest({ message, helperType, categories, accessToken: user.accessToken });
      const newReq = {
        id: result.session_id,
        helperType: result.helper_type || helperType,
        message: result.message || message,
        categories: result.categories || categories,
        time: 'just now',
        status: 'pending',
        waiting: true,
        acceptanceCount: 0,
        responses: [],
      };
      setRequests(prev => [newReq, ...prev]);
      setDrawerOpen(false);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to send request. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSession = (sessionId) => navigate(`/session/${sessionId}`);

  const handleDelete = async (sessionId) => {
    if (!user?.accessToken) return;
    try {
      await deleteHelpRequest(sessionId, user.accessToken);
      setRequests(prev => prev.filter(r => r.id !== sessionId));
    } catch (err) {
      alert(err.message || 'Failed to delete request.');
    }
  };

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <TopBar title="Get Support" />

      <div className={styles.page}>

        {loadingRequests ? (
          <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : isFirstTime ? (
          /* ── First time: show form inline ── */
          <div className={styles.firstTimeLayout}>
            <ComposeForm onSend={handleSend} isDrawer={false} submitting={submitting} error={error} />
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
              {requests.map(req => (
                <RequestItem key={req.id} req={req} onSession={handleSession} onDelete={handleDelete} />
              ))}
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
              <ComposeForm onSend={handleSend} isDrawer submitting={submitting} error={error} />
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
