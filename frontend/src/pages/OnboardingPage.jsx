import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { storeAssessments, submitInitialAssessment, getErrorMessage } from '../api/endpoints';
import styles from './OnboardingPage.module.css';

const STEPS = [
  {
    id: 'last_okay',
    empathy: "Thanks for sharing — I know that's not easy.",
    empathyHi: 'हामी बुझ्छौं - यो साझा गर्नु सजिलो छैन।',
    question: 'When was the last time you felt truly okay?',
    questionHi: 'तपाईंले अन्तिम पटक कहिले साँच्चै राम्रो महसुस गर्नुभएको थियो?',
    options: [
      { value: 'today', label: 'Today', labelHi: 'आज' },
      { value: 'few_days', label: 'A few days ago', labelHi: 'केही दिन अघि' },
      { value: 'last_week', label: 'Last week', labelHi: 'गत हप्ता' },
      { value: 'cant_remember', label: "I can't remember", labelHi: 'मलाई सम्झना छैन' },
    ],
  },
  {
    id: 'mood',
    empathy: "You're doing great by being here.",
    empathyHi: 'तपाईं बहादुर हुनुहुन्छ।',
    question: 'Over the past 2 weeks, how often have you felt down or hopeless?',
    questionHi: 'पछिल्लो २ हप्तामा तपाईं कति पटक उदास वा निराश महसुस गर्नुभयो?',
    options: [
      { value: 'not_at_all', label: 'Not at all', labelHi: 'बिल्कुल छैन' },
      { value: 'several_days', label: 'Several days', labelHi: 'केही दिन' },
      { value: 'more_than_half', label: 'More than half the days', labelHi: 'आधाभन्दा बढी दिन' },
      { value: 'nearly_every_day', label: 'Nearly every day', labelHi: 'लगभग हर दिन' },
    ],
  },
  {
    id: 'domain',
    empathy: 'Understanding what weighs on you most helps us connect you better.',
    empathyHi: 'हामी तपाईंलाई राम्रोसँग सहयोग गर्न चाहन्छौं।',
    question: 'What area of your life feels most affected right now?',
    questionHi: 'हाल तपाईंको जीवनको कुन क्षेत्र सबैभन्दा बढी प्रभावित छ?',
    options: [
      { value: 'relationship', label: 'Relationship', labelHi: 'सम्बन्ध' },
      { value: 'work', label: 'Work / Career', labelHi: 'काम / क्यारियर' },
      { value: 'family', label: 'Family', labelHi: 'परिवार' },
      { value: 'financial', label: 'Financial stress', labelHi: 'आर्थिक तनाव' },
      { value: 'other', label: 'Something else', labelHi: 'अरु केही' },
    ],
  },
  {
    id: 'helper_type',
    empathy: 'Almost done — just one more question.',
    empathyHi: 'लगभग सकियो — अझ एउटा प्रश्न।',
    question: 'Who would you prefer to talk to?',
    questionHi: 'तपाईं कससँग कुरा गर्न चाहनुहुन्छ?',
    options: [
      { value: 'peer', label: 'Peer Supporter', labelHi: 'एक साथी जो बुझोस्' },
      { value: 'therapist', label: 'Verified Therapist', labelHi: 'लाइसेन्स प्राप्त थेरापिस्ट' },
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { answers, currentStep, setAnswer, nextStep, prevStep } = useOnboarding();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const step = STEPS[currentStep];
  const total = STEPS.length;
  const isLast = currentStep === total - 1;
  const pct = Math.round(((currentStep + 1) / total) * 100);

  const handleContinue = async () => {
    if (isLast) {
      // Submit assessment to backend
      if (user?.userId) {
        setIsSubmitting(true);
        setError(null);
        try {
          // Format answers as Q&A pairs for storing
          const assessmentItems = STEPS.map(s => ({
            question: s.question,
            answer: answers[s.id] || 'skipped',
          }));
          
          // Store individual Q&A pairs in UserAssessment table
          await storeAssessments(assessmentItems);
          
          // Format as conversation string for analysis
          const conversationString = assessmentItems
            .map(item => `Q: ${item.question}\nA: ${item.answer}`)
            .join('\n\n');
          
          // Analyze and create initial_assessment
          await submitInitialAssessment(conversationString);
        } catch (err) {
          console.error('Failed to submit assessment:', err);
          // Continue to results even if submission fails
          setError(getErrorMessage(err));
        } finally {
          setIsSubmitting(false);
        }
      }
      navigate('/onboarding/results');
    } else {
      nextStep();
    }
  };

  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />

      {/* Fixed Header */}
      <header className={styles.header}>
        <span className={styles.logo}>Gunaso</span>
        <button className={styles.closeBtn} onClick={() => navigate('/')}>✕</button>
      </header>

      {/* Scrollable Main */}
      <main className={styles.main}>
        {/* Progress */}
        <div className={styles.progressWrap}>
          <div className={styles.progressMeta}>
            <span className={styles.progressLabel}>You're doing great, Step {currentStep + 1} of {total}</span>
            <span className={styles.progressPct}>{pct}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Empathy Card */}
        <div className={styles.empathyCard}>
          <div className={styles.empathyIcon}>♥</div>
          <div>
            <h2 className={styles.empathyTitle}>{step.empathy}</h2>
            <p className={styles.empathyHi}>{step.empathyHi}</p>
          </div>
        </div>

        {/* Question */}
        <div className={styles.questionWrap}>
          <h1 className={styles.question}>{step.question}</h1>
          <p className={styles.questionHi}>{step.questionHi}</p>
        </div>

        {/* Options */}
        <div className={styles.options}>
          {step.options.map((opt) => {
            const isSelected = answers[step.id] === opt.value;
            return (
              <button
                key={opt.value}
                className={[styles.option, isSelected ? styles.optionSelected : ''].join(' ')}
                onClick={() => setAnswer(step.id, opt.value)}
              >
                <div className={styles.optionText}>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  <span className={styles.optionLabelHi}>{opt.labelHi}</span>
                </div>
                <div className={[styles.radio, isSelected ? styles.radioSelected : ''].join(' ')}>
                  {isSelected && <div className={styles.radioDot} />}
                </div>
              </button>
            );
          })}
        </div>

      </main>

      {/* Fixed Footer */}
      <footer className={styles.footer}>
        <button
          className={styles.backBtn}
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
        >
          ← Back
        </button>
        <div className={styles.footerRight}>
          <button className={styles.skipBtn} onClick={handleContinue} disabled={isSubmitting}>
            Skip for now <span className={styles.skipArrow}>→</span>
          </button>
          <button
            className={styles.continueBtn}
            onClick={handleContinue}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isLast ? 'See My Results' : 'Continue'} →
          </button>
        </div>
      </footer>
      
      {/* Error display */}
      {error && (
        <div className={styles.errorToast}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
}
