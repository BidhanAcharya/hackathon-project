import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

function SignupForm({ onSwitch }) {
  const navigate = useNavigate();
  const { loginAsSeeker } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    aliasName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.aliasName || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
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
    // Mock signup — set user then go to onboarding
    const anonId = Math.floor(1000 + Math.random() * 9000);
    loginAsSeeker(anonId, 'mock-token');
    navigate('/onboarding');
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Your safe space starts here. It's free and anonymous.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              type="text"
              name="fullName"
              placeholder="Your real name"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Alias Name</label>
            <input
              className={styles.input}
              type="text"
              name="aliasName"
              placeholder="How others will see you"
              value={form.aliasName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="you@example.com"
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

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn}>
          Create Account →
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <button className={styles.switchLink} onClick={onSwitch}>
          Log in
        </button>
      </p>
    </>
  );
}

function LoginForm({ onSwitch }) {
  const navigate = useNavigate();
  const { loginAsSeeker } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    // Mock login — go to onboarding
    const anonId = Math.floor(1000 + Math.random() * 9000);
    loginAsSeeker(anonId, 'mock-token');
    navigate('/onboarding');
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to continue your journey.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="you@example.com"
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

        <button type="submit" className={styles.submitBtn}>
          Log In →
        </button>
      </form>

      <p className={styles.switchText}>
        Don't have an account?{' '}
        <button className={styles.switchLink} onClick={onSwitch}>
          Sign up
        </button>
      </p>
    </>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(location.pathname === '/login' ? 'login' : 'signup');

  const switchToLogin = () => {
    setMode('login');
    navigate('/login', { replace: true });
  };

  const switchToSignup = () => {
    setMode('signup');
    navigate('/signup', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />

      {/* Header */}
      <header className={styles.header}>
        <span className={styles.logo}>Mental Wizard</span>
        <button className={styles.closeBtn} onClick={() => navigate('/')}>✕</button>
      </header>

      {/* Toggle tabs */}
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

      {/* Card */}
      <div className={styles.card}>
        {mode === 'signup'
          ? <SignupForm onSwitch={switchToLogin} />
          : <LoginForm onSwitch={switchToSignup} />
        }
      </div>
    </div>
  );
}
