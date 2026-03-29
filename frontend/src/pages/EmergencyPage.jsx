import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './EmergencyPage.module.css';

const helplines = [
  {
    name: 'National Suicide Prevention Helpline',
    number: '1166',
    description: 'Free, 24/7 national suicide prevention helpline managed by TPO Nepal. Provides immediate crisis intervention, counseling, and follow-up care.',
    hours: '24/7',
    isPrimary: true,
  },
  {
    name: 'TPO Nepal',
    number: '1660-0102005',
    altContact: 'Text: 9847386158',
    description: 'Emotional support for anxiety, depression, bullying, and self-harm.',
    hours: '8 AM - 8 PM daily',
  },
  {
    name: 'TUTH Suicide Prevention',
    number: '1660-0121600',
    altContact: 'Psychiatry: 9841630430',
    description: 'Tribhuvan University Teaching Hospital suicide prevention and psychiatry help line.',
    hours: '24 hours',
  },
  {
    name: 'CMC Nepal',
    number: '1660-0185080',
    description: 'Free support for anxiety, depression, loneliness, and stress.',
    hours: 'Contact for hours',
  },
  {
    name: 'Koshish',
    number: '1660-0122322',
    description: 'Mental health and psychosocial support services.',
    hours: 'Contact for hours',
  },
  {
    name: 'Blue Diamond Society',
    number: '15547460',
    description: 'LGBTQIA+ specific psychological counseling.',
    hours: 'By appointment',
  },
  {
    name: 'Kanti Children Hospital',
    number: '9808522410',
    description: 'Child psychiatric help line.',
    hours: 'Contact for hours',
  },
];

const emergencyNumbers = [
  { name: 'Police Emergency', number: '100' },
  { name: 'General Emergency', number: '112' },
];

function HelplineCard({ helpline }) {
  return (
    <div className={`${styles.helplineCard} ${helpline.isPrimary ? styles.primaryCard : ''}`}>
      <div className={styles.helplineHeader}>
        <h3 className={styles.helplineName}>{helpline.name}</h3>
        {helpline.isPrimary && <span className={styles.primaryBadge}>24/7 PRIMARY</span>}
      </div>
      <p className={styles.helplineDesc}>{helpline.description}</p>
      <div className={styles.helplineContact}>
        <a href={`tel:${helpline.number.replace(/-/g, '')}`} className={styles.phoneNumber}>
          📞 {helpline.number}
        </a>
        {helpline.altContact && (
          <span className={styles.altContact}>{helpline.altContact}</span>
        )}
      </div>
      <p className={styles.helplineHours}>⏰ {helpline.hours}</p>
    </div>
  );
}

function EmergencyCard({ emergency }) {
  return (
    <a href={`tel:${emergency.number}`} className={styles.emergencyCard}>
      <span className={styles.emergencyIcon}>🚨</span>
      <div className={styles.emergencyInfo}>
        <p className={styles.emergencyName}>{emergency.name}</p>
        <p className={styles.emergencyNumber}>{emergency.number}</p>
      </div>
    </a>
  );
}

export default function EmergencyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.logoIcon}>+</span>
          <span className={styles.logoName}>Gunaso</span>
        </button>
        <div className={styles.navTitle}>
          <h1>Crisis Helplines</h1>
          <p>You are not alone — help is available</p>
        </div>
        <button className={styles.backBtn} onClick={() => navigate(user ? '/dashboard' : '/')}>
          ← {user ? 'Dashboard' : 'Home'}
        </button>
      </header>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.alertBanner}>
            <span className={styles.alertIcon}>❤️</span>
            <div className={styles.alertText}>
              <h2 className={styles.alertTitle}>If you're in immediate danger, call emergency services</h2>
              <p className={styles.alertDesc}>
                These helplines are staffed by trained professionals ready to support you. All calls are confidential.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.emergencySection}>
          <h3 className={styles.sectionTitle}>Emergency Services</h3>
          <div className={styles.emergencyGrid}>
            {emergencyNumbers.map((e, i) => (
              <EmergencyCard key={i} emergency={e} />
            ))}
          </div>
        </div>

        <div className={styles.helplinesSection}>
          <h3 className={styles.sectionTitle}>Mental Health Helplines</h3>
          <div className={styles.helplineGrid}>
            {helplines.map((h, i) => (
              <HelplineCard key={i} helpline={h} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
