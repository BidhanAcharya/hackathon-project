import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../AuthPage.module.css';

function HelperSignupForm({ onSwitch }) {
  const navigate = useNavigate();
  const { loginAsHelper } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    licenseNumber: '',
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
    if (!form.fullName || !form.email || !form.licenseNumber || !form.password || !form.confirmPassword) {
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
    loginAsHelper(form.fullName, 'mock-token');
    navigate('/helper/dashboard');
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <h1 className={styles.title}>Join as a Helper</h1>
        <p className={styles.subtitle}>Register your credentials and start supporting others.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.row}>
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
            <label className={styles.label}>License Number</label>
            <input
              className={styles.input}
              type="text"
              name="licenseNumber"
              placeholder="e.g. MH-2024-0012"
              value={form.licenseNumber}
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
          Create Helper Account →
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
    // Mock login — derive name from email
    const name = form.email.split('@')[0];
    loginAsHelper(name, 'mock-token');
    navigate('/helper/dashboard');
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

        <button type="submit" className={styles.submitBtn}>
          Log In →
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
