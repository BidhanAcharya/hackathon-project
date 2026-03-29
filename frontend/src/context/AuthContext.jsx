import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe, loginHelper, registerHelper, getHelperMe } from '../api/auth';

const AuthContext = createContext(null);

const STORAGE_KEY = 'mw_auth';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.accessToken) {
      const fetchMe = saved.role === 'helper'
        ? getHelperMe(saved.accessToken)
        : getMe(saved.accessToken);

      fetchMe
        .then(data => {
          setUser({
            username: data.username,
            email: data.email,
            role: saved.role,
            anonId: saved.anonId,
            alias: data.alias || saved.alias,
            helperRole: data.role || saved.helperRole,   // "peer" or "therapist" for helpers
            userId: data.user_id ?? data.helper_id,
            name: data.username,
            accessToken: saved.accessToken,
            refreshToken: saved.refreshToken,
          });
        })
        .catch(() => localStorage.removeItem(STORAGE_KEY))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function _persist(userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      role: userData.role,
      anonId: userData.anonId,
      alias: userData.alias,
      helperRole: userData.helperRole,
    }));
    setUser(userData);
  }

  // ── Seeker ──────────────────────────────────────────────
  async function signupAsSeeker({ username, email, password, alias }) {
    await registerUser({ username, email, password, alias });
    await loginAsSeeker({ email, password });
  }

  async function loginAsSeeker({ email, password }) {
    const tokens = await loginUser({ email, password });
    const me = await getMe(tokens.access_token);
    const anonId = Math.floor(1000 + Math.random() * 9000);
    _persist({
      username: me.username,
      email: me.email,
      name: me.username,
      role: 'seeker',
      userId: me.user_id,
      anonId,
      alias: me.alias,
      helperRole: null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  }

  // ── Helper ──────────────────────────────────────────────
  async function signupAsHelper({ username, email, password, role, proof_id, alias }) {
    await registerHelper({ username, email, password, domain_expertise: 'general', role, proof_id, alias });
    await loginAsHelper({ email, password });
  }

  async function loginAsHelper({ email, password }) {
    const tokens = await loginHelper({ email, password });
    const me = await getHelperMe(tokens.access_token);
    _persist({
      username: me.username,
      email: me.email,
      name: me.username,
      role: 'helper',
      userId: me.helper_id,
      anonId: null,
      alias: me.alias,
      helperRole: me.role || 'peer',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginAsSeeker,
      signupAsSeeker,
      loginAsHelper,
      signupAsHelper,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
