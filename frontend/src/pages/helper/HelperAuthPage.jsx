import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../AuthPage.module.css';

function HelperSignupForm({ onSwitch }) {
  const navigate = useNavigate();
  const { signupAsHelper } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'peer',          // 'peer' or 'therapist'
    proofId: '',           // required for therapist
    alias: '',             // optional display name
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRoleSelect = (role) => {
    setForm((prev) => ({ ...prev, role, proofId: '', alias: '' }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.role === 'therapist' && !form.proofId.trim()) {
      setError('Therapists must provide a Proof ID (license or credential number).');
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      await signupAsHelper({
        username: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        proof_id: form.role === 'therapist' ? form.proofId.trim() : undefined,
        alias: form.alias.trim() || undefined,
      });
      navigate('/helper/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Join as a Helper</h1>
        <p className={styles.subtitle}>Register your credentials and start supporting others.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Role selection */}
        <div className={styles.field}>
          <label className={styles.label}>I am a</label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleRoleSelect('peer')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: form.role === 'peer' ? '2px solid #6c63ff' : '1.5px solid #e0e0e0',
                background: form.role === 'peer' ? '#f0eeff' : '#fafafa',
                color: form.role === 'peer' ? '#6c63ff' : '#555',
                fontWeight: form.role === 'peer' ? 700 : 400,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              🤝 Peer Supporter
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('therapist')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: form.role === 'therapist' ? '2px solid #0ea5e9' : '1.5px solid #e0e0e0',
                background: form.role === 'therapist' ? '#e0f4ff' : '#fafafa',
                color: form.role === 'therapist' ? '#0ea5e9' : '#555',
                fontWeight: form.role === 'therapist' ? 700 : 400,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              🩺 Verified Therapist
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.4rem' }}>
            {form.role === 'peer'
              ? 'You will support seekers looking for peer emotional support.'
              : 'You will support seekers seeking professional therapy. Proof ID required.'}
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input
            className={styles.input}
            type="text"
            name="fullName"
            placeholder={form.role === 'therapist' ? 'Dr. Jane Smith' : 'Your name'}
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder={form.role === 'therapist' ? 'you@clinic.com' : 'you@example.com'}
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>New Password</label>
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Confirm Password</label>
          <input
            className={styles.input}
            type="password"
            name="confirmPassword"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        {/* Therapist: Proof ID (required) */}
        {form.role === 'therapist' && (
          <div className={styles.field}>
            <label className={styles.label}>
              Proof ID <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <input
              className={styles.input}
              type="text"
              name="proofId"
              placeholder="License or credential number (e.g. PSY-123456)"
              value={form.proofId}
              onChange={handleChange}
            />
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
              Your credential will be verified before you appear to seekers.
            </p>
          </div>
        )}

        {/* Peer: Alias (optional) */}
        {form.role === 'peer' && (
          <div className={styles.field}>
            <label className={styles.label}>Display Alias <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
            <input
              className={styles.input}
              type="text"
              name="alias"
              placeholder="e.g. CalmMind · leave blank for random"
              value={form.alias}
              onChange={handleChange}
            />
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
              Seekers will see this name. Leave blank and we'll assign one like "Peer_4821".
            </p>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Creating account…' : 'Create Helper Account →'}
        </button>
      </form>

      <p className={styles.switchText}>
        Already registered?{' '}
        <button className={styles.switchLink} onClick={onSwitch}>
          Log in
        </button>
      </p>
    </>
  );
}

function HelperLoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const { loginAsHelper } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      await loginAsHelper({ email: form.email, password: form.password });
      navigate('/helper/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Helper Login</h1>
        <p className={styles.subtitle}>Welcome back. Your patients are waiting.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="you@clinic.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Logging in…' : 'Log In →'}
        </button>
      </form>

      <p className={styles.switchText}>
        New helper?{' '}
        <button className={styles.switchLink} onClick={onSwitch}>
          Register here
        </button>
      </p>
    </>
  );
}

export default function HelperAuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(location.pathname === '/helper/login' ? 'login' : 'signup');

  const switchToLogin = () => {
    setMode('login');
    navigate('/helper/login', { replace: true });
  };

  const switchToSignup = () => {
    setMode('signup');
    navigate('/helper/signup', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />

      <header className={styles.header}>
        <span className={styles.logo}>Mental Wizard · Helpers</span>
        <button className={styles.closeBtn} onClick={() => navigate('/')}>✕</button>
      </header>

      <div className={styles.tabs}>
        <button
          className={[styles.tab, mode === 'signup' ? styles.tabActive : ''].join(' ')}
          onClick={switchToSignup}
        >
          Sign Up
        </button>
        <button
          className={[styles.tab, mode === 'login' ? styles.tabActive : ''].join(' ')}
          onClick={switchToLogin}
        >
          Log In
        </button>
      </div>

      <div className={styles.card}>
        {mode === 'signup'
          ? <HelperSignupForm onSwitch={switchToLogin} />
          : <HelperLoginForm onSwitch={switchToSignup} />
        }
      </div>
    </div>
  );
}
