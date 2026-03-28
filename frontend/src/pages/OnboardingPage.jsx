import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import ProgressBar from '../components/onboarding/ProgressBar';
import QuestionCard from '../components/onboarding/QuestionCard';
import styles from './OnboardingPage.module.css';

const STEPS = [
  {
    id: 'last_okay',
    empathy: "Thanks for sharing — I know that's not easy.",
    empathyHi: 'यहाँ आने के लिए शुक्रिया।',
    question: 'When was the last time you felt truly okay?',
    questionHi: 'आखिरी बार आपने खुद को ठीक कब महसूस किया?',
    options: [
      { value: 'today', label: 'Today', labelHi: 'आज' },
      { value: 'few_days', label: 'A few days ago', labelHi: 'कुछ दिन पहले' },
      { value: 'last_week', label: 'Last week', labelHi: 'पिछले हफ्ते' },
      { value: 'cant_remember', label: "I can't remember", labelHi: 'याद नहीं' },
    ],
  },
  {
    id: 'mood',
    empathy: "You're doing great by being here.",
    empathyHi: 'आप बहादुर हैं।',
    question: 'Over the past 2 weeks, how often have you felt down or hopeless?',
    questionHi: 'पिछले 2 हफ्तों में आप कितनी बार उदास या निराश महसूस किए?',
    options: [
      { value: 'not_at_all', label: 'Not at all', labelHi: 'बिल्कुल नहीं' },
      { value: 'several_days', label: 'Several days', labelHi: 'कुछ दिन' },
      { value: 'more_than_half', label: 'More than half the days', labelHi: 'आधे से ज़्यादा दिन' },
      { value: 'nearly_every_day', label: 'Nearly every day', labelHi: 'लगभग हर दिन' },
    ],
  },
  {
    id: 'domain',
    empathy: 'Understanding what weighs on you most helps us connect you better.',
    empathyHi: 'हम आपकी मदद के लिए यहाँ हैं।',
    question: 'What area of your life feels most affected right now?',
    questionHi: 'अभी आपके जीवन का कौन सा क्षेत्र सबसे ज़्यादा प्रभावित लगता है?',
    options: [
      { value: 'relationship', label: 'Relationship', labelHi: 'रिश्ते' },
      { value: 'work', label: 'Work / Career', labelHi: 'काम / करियर' },
      { value: 'family', label: 'Family', labelHi: 'परिवार' },
      { value: 'financial', label: 'Financial stress', labelHi: 'आर्थिक तनाव' },
      { value: 'other', label: 'Something else', labelHi: 'कुछ और' },
    ],
  },
  {
    id: 'helper_type',
    empathy: 'Almost done — just one more question.',
    empathyHi: 'बस एक आखिरी सवाल।',
    question: 'Who would you prefer to talk to?',
    questionHi: 'आप किससे बात करना पसंद करेंगे?',
    options: [
      { value: 'peer', label: 'Peer Supporter', labelHi: 'एक साथी जो समझे' },
      { value: 'therapist', label: 'Verified Therapist', labelHi: 'लाइसेंस प्राप्त थेरेपिस्ट' },
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { answers, currentStep, setAnswer, nextStep, prevStep } = useOnboarding();
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleContinue = () => {
    if (isLast) {
      navigate('/onboarding/results');
    } else {
      nextStep();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <ProgressBar step={currentStep + 1} total={STEPS.length} />
          <button className={styles.closeBtn} onClick={() => navigate('/')}>×</button>
        </div>

        <div className={styles.body}>
          <QuestionCard
            {...step}
            selected={answers[step.id]}
            onSelect={(val) => setAnswer(step.id, val)}
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={prevStep} disabled={currentStep === 0}>
            ← Back
          </button>
          <div className={styles.footerRight}>
            <button className={styles.skipBtn} onClick={handleContinue}>Skip for now ↓</button>
            <button
              className={styles.continueBtn}
              onClick={handleContinue}
              disabled={!answers[step.id]}
            >
              {isLast ? 'See My Results →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
