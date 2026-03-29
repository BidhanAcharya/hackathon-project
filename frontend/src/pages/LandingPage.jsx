import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import styles from './LandingPage.module.css';

function TrustPillar({ icon, title, description }) {
  return (
    <div className={styles.pillar}>
      <div className={styles.pillarIcon}>{icon}</div>
      <h3 className={styles.pillarTitle}>{title}</h3>
      <p className={styles.pillarDesc}>{description}</p>
    </div>
  );
}

function CommunityCard({ title, description, image }) {
  return (
    <div className={styles.communityCard}>
      <div className={styles.communityCardImg}><img src={image} alt={title}/></div>
      <h4 className={styles.communityCardTitle}>{title}</h4>
      <p className={styles.communityCardDesc}>{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'helper') {
        navigate('/helper/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleHelperClick = () => {
    navigate('/helper/login');
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Gunaso</p>
          <h2 className={styles.heroHeadline}>तपाईंको गुनासो, हाम्रो सल्लाह</h2>
          <p className={styles.heroSubText}>A safe space to breathe.</p>
          <p className={styles.heroBody}>
            Connect anonymously with peer supporters and verified therapists.
            Your identity is always protected.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.primaryBtn} onClick={() => navigate('/signup')}>
              I need support →
            </button>
            <button className={styles.ghostBtn} onClick={handleHelperClick}>
              I want to help others
            </button>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroImagePlaceholder} >
            <img src="/images/e.jpg" alt="Hero" />
          </div>
        </div>
      </section>

       {/* Community Choice */}
       <section className={styles.community} id="community">
        <h2 className={styles.sectionTitle}>Community Choice</h2>
        <div className={styles.communityGrid}>
          <CommunityCard title="Anonymous Peer Support" description="Talk to someone who truly understands what you're going through." image="/images/b.jpg"  />
          <CommunityCard title="Licensed Therapists" description="Professional care from verified clinical psychologists." image="/images/c.jpg"/>
          <CommunityCard title="AI Companion" description="Available 24/7 — your first step toward feeling better." image="/images/d.jpg"/>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className={styles.trust} id="features">
        <h2 className={styles.sectionTitle}>Foundation of Trust</h2>
        <div className={styles.pillars}>
          <TrustPillar icon="🔒" title="100% Anonymous" description="Your identity is never revealed to helpers or therapists." />
          <TrustPillar icon="🤝" title="Peer / Human Support" description="Real people who listen, not just algorithms." />
          <TrustPillar icon="✓" title="Verified Helpers" description="All therapists are licensed with 5+ years experience." />
        </div>
      </section>

      {/* Daily Check-in Feature */}
      <section className={styles.checkinSection} id="how-it-works">
        <div className={styles.checkinContent}>
          <h2 className={styles.sectionTitle}>Daily Mindful Check-ins</h2>
          <ul className={styles.checkinList}>
            <li>Track your mood patterns over time</li>
            <li>AI-powered insights from your responses</li>
            <li>Gentle reminders to check in daily</li>
            <li>Private and fully encrypted</li>
          </ul>
        </div>
        <div className={styles.checkinChart}>
          <div className={styles.chartBars}>
            {[60, 80, 45, 90, 70, 85, 75].map((h, i) => (
              <div key={i} className={styles.bar} style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className={styles.chartLabel}>7-Day Mood Trend</p>
        </div>
      </section>

     

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaTitle}>Ready to take a breath?</h2>
        <p className={styles.ctaSubtitle}>Join thousands finding peace of mind through Gunaso.</p>
        <div className={styles.ctaBtns}>
          <button className={styles.ctaBannerBtn} onClick={() => navigate('/signup')}>I need support →</button>
          <button className={styles.ctaBannerGhost} onClick={handleHelperClick}>I want to help others</button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span className={styles.logoIcon}>+</span>
          <span className={styles.footerLogoName}>Gunaso</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <p className={styles.footerCopy}>© 2026 Gunaso. All rights reserved.</p>
      </footer>
    </div>
  );
}
