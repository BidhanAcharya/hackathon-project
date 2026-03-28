import { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const setAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextStep = () => setCurrentStep(s => s + 1);
  const prevStep = () => setCurrentStep(s => Math.max(0, s - 1));
  const reset = () => { setAnswers({}); setCurrentStep(0); };

  return (
    <OnboardingContext.Provider value={{ answers, currentStep, setAnswer, nextStep, prevStep, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
