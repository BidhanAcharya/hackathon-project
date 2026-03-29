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
  });
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
    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    submitting.current = true;
    setLoading(true);
    try {
      await signupAsHelper({ username: form.fullName, email: form.email, password: form.password });
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
        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input
            className={styles.input}
            type="text"
            name="fullName"
            placeholder="Dr. Jane Smith"
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
            placeholder="you@clinic.com"
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
        <span className={styles.logo} onClick={() => navigate('/')}>Gunaso · Helpers</span>
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
