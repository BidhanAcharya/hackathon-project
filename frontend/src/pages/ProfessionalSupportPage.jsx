import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import TopBar from '../components/layout/TopBar';
import { useAuth } from '../context/AuthContext';
import styles from './ProfessionalSupportPage.module.css';

const DOMAINS = ['ANXIETY', 'CAREER', 'RELATIONSHIPS', 'SLEEP', 'GRIEF', 'OTHER'];

export default function ProfessionalSupportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [helperType, setHelperType] = useState('peer');
  const [message, setMessage] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);

  const toggleDomain = (d) => {
    setSelectedDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSend = () => navigate('/session/mock-session');

  return (
    <AppLayout role="seeker" anonId={user?.anonId}>
      <TopBar title="Get Professional Support" />
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.privacyNote}>
            🔒 Your identity remains completely anonymous. Helpers only see your non-identifying brief.
          </div>

          <div className={styles.toggle}>
            <button className={[styles.toggleBtn, helperType === 'peer' ? styles.toggleActive : ''].join(' ')} onClick={() => setHelperType('peer')}>
              Peer Supporter
            </button>
            <button className={[styles.toggleBtn, helperType === 'therapist' ? styles.toggleActive : ''].join(' ')} onClick={() => setHelperType('therapist')}>
              Verified Therapist
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Optional Message to the Helper</label>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us a little bit about what's on your mind today..."
              maxLength={500}
              rows={5}
            />
            <span className={styles.charCount}>{message.length}/500</span>
          </div>

          <button className={styles.sendBtn} onClick={handleSend}>
            Send Request to Helpers ▶
          </button>

          <div className={styles.responseTime}>
            ⚡ AVERAGE RESPONSE TIME: UNDER 10 MINUTES
          </div>

          <div className={styles.domains}>
            {DOMAINS.map(d => (
              <button
                key={d}
                className={[styles.domainChip, selectedDomains.includes(d) ? styles.domainActive : ''].join(' ')}
                onClick={() => toggleDomain(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <p className={styles.previewLabel}>HELPER VIEW PREVIEW</p>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewAnon}>Anon #4821</span>
              <span className={styles.previewTime}>just now</span>
            </div>
            <div className={styles.previewTags}>
              <span className={styles.previewTag}>Work Stress</span>
              <span className={styles.previewTag}>Low Mood</span>
            </div>
            <p className={styles.previewMessage}>
              {message || 'Your message will appear here...'}
            </p>
            <p className={styles.previewNote}>This is exactly what the helper will see.</p>
          </div>

          <div className={styles.trustCard}>
            {helperType === 'peer' ? (
              <>
                <div className={styles.trustAvatar} />
                <div>
                  <p className={styles.trustTitle}>Verified Care</p>
                  <p className={styles.trustDesc}>All peer supporters are trained and verified by our team.</p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.trustAvatar} />
                <div>
                  <p className={styles.trustTitle}>Licensed Clinical Psychologist</p>
                  <p className={styles.trustDesc}>Board-certified professional with doctorate-level training in clinical therapy.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
