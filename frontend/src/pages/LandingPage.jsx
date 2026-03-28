import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
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

function CommunityCard({ title, description }) {
  return (
    <div className={styles.communityCard}>
      <div className={styles.communityCardImg} />
      <h4 className={styles.communityCardTitle}>{title}</h4>
      <p className={styles.communityCardDesc}>{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>MANSAATHI · MENTAL HEALTH SUPPORT</p>
          <h1 className={styles.heroHeadline}>A safe space to breathe.</h1>
          <p className={styles.heroSubText}>मन की बात, बेझिझक।</p>
          <p className={styles.heroBody}>
            Connect anonymously with peer supporters and verified therapists.
            Your identity is always protected.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.primaryBtn} onClick={() => navigate('/onboarding')}>
              Get Support →
            </button>
            <button className={styles.ghostBtn} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroImagePlaceholder} />
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

      {/* Community Choice */}
      <section className={styles.community} id="community">
        <h2 className={styles.sectionTitle}>Community Choice</h2>
        <div className={styles.communityGrid}>
          <CommunityCard title="Anonymous Peer Support" description="Talk to someone who truly understands what you're going through." />
          <CommunityCard title="Licensed Therapists" description="Professional care from verified clinical psychologists." />
          <CommunityCard title="AI Companion" description="Available 24/7 — your first step toward feeling better." />
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaTitle}>Ready to take a breath?</h2>
        <p className={styles.ctaSubtitle}>Join thousands finding peace of mind through MansaathI.</p>
        <div className={styles.ctaBtns}>
          <button className={styles.ctaBannerBtn} onClick={() => navigate('/onboarding')}>Get Support →</button>
          <button className={styles.ctaBannerGhost}>Learn More</button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span className={styles.logoIcon}>+</span>
          <span className={styles.footerLogoName}>SereneCare</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <p className={styles.footerCopy}>© 2026 SereneCare. All rights reserved.</p>
      </footer>
    </div>
  );
}
