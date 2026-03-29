import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllSessions, deleteSession, getErrorMessage } from '../../api/endpoints';
import styles from './Sidebar.module.css';

const seekerNav = [
  { label: 'Home', icon: '⊞', to: '/dashboard' },
  { label: 'Support', icon: '🤝', to: '/professional-support' },
  { label: 'Chat', icon: '💬', to: '/chat' },
];

const helperNav = [
  { label: 'Clinical Dashboard', icon: '⊞', to: '/helper/dashboard' },
  { label: 'History & Feedback', icon: '📋', to: '/helper/history' },
  { label: 'Settings', icon: '⚙', to: '/helper/settings' },
];

export default function Sidebar({ role = 'seeker', anonId = '4821' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const isOnChatPage = location.pathname === '/chat' || location.pathname.startsWith('/chat?');
  const currentSessionId = searchParams.get('session');

  // Fetch sessions when on chat page
  useEffect(() => {
    const fetchSessions = async () => {
      if (!isOnChatPage || !isAuthenticated || role !== 'seeker') return;
      
      setLoadingSessions(true);
      try {
        const data = await getAllSessions();
        if (data.sessions) {
          setSessions(data.sessions);
        } else if (Array.isArray(data)) {
          setSessions(data);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', getErrorMessage(err));
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [isOnChatPage, isAuthenticated, role, currentSessionId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNewChat = () => {
    // Navigate to /chat without session param to start fresh
    navigate('/chat', { replace: false });
    // Force reload to reset the chat state
    window.location.reload();
  };

  const handleSessionClick = (sessionId) => {
    navigate(`/chat?session=${sessionId}`);
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    } catch (err) {
      console.error('Failed to delete session:', getErrorMessage(err));
    }
  };

  const navItems = role === 'helper' ? helperNav : seekerNav;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>+</span>
        <div>
          <div className={styles.logoName}>Gunaso</div>
          <div className={styles.logoSub}>MENTAL HEALTH SUPPORT</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => [styles.navItem, isActive ? (role === 'helper' ? styles.helperActive : styles.active) : ''].join(' ')}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}

        {/* Chat Sessions - only visible on chat page */}
        {isOnChatPage && role === 'seeker' && (
          <div className={styles.sessionsSection}>
            <div className={styles.sessionsHeader}>
              <span className={styles.sessionsTitle}>Chat History</span>
              <button className={styles.newChatBtn} onClick={handleNewChat} title="New Chat">
                +
              </button>
            </div>
            
            {loadingSessions ? (
              <div className={styles.sessionLoading}>Loading...</div>
            ) : sessions.length === 0 ? (
              <div className={styles.noSessions}>No previous chats</div>
            ) : (
              <div className={styles.sessionsList}>
                {sessions.map((session) => {
                  const isCurrentSession = session.session_id === currentSessionId;
                  return (
                    <div
                      key={session.session_id}
                      className={[styles.sessionItem, isCurrentSession ? styles.sessionActive : ''].join(' ')}
                      onClick={() => handleSessionClick(session.session_id)}
                    >
                      <span className={styles.sessionIcon}>💬</span>
                      <span className={styles.sessionTitle}>
                        {session.title || 'New conversation'}
                      </span>
                      <button
                        className={styles.sessionDeleteBtn}
                        onClick={(e) => handleDeleteSession(e, session.session_id)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className={styles.bottom}>
        {role === 'seeker' ? (
          <>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <span className={styles.navIcon}>↩</span>
              <span className={styles.navLabel}>Logout</span>
            </button>
          </>
        ) : (
          <>
            <div className={styles.helperProfile}>
              <div className={styles.anonAvatar} />
              <div>
                <div className={styles.helperName}>{user?.name ?? 'Helper'}</div>
                <div className={styles.helperStatus}>
                  <span className={styles.statusDot} />
                  Available
                </div>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <span className={styles.navIcon}>↩</span>
              <span className={styles.navLabel}>Logout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
