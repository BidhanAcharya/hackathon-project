import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import LandingPage from '../pages/LandingPage';
import OnboardingPage from '../pages/OnboardingPage';
import OnboardingResultsPage from '../pages/OnboardingResultsPage';
import SeekerDashboard from '../pages/SeekerDashboard';
import AIChatPage from '../pages/AIChatPage';
import ProfessionalSupportPage from '../pages/ProfessionalSupportPage';
import SessionPage from '../pages/SessionPage';
import HelperDashboard from '../pages/helper/HelperDashboard';
import RequestBriefPage from '../pages/helper/RequestBriefPage';
import HelperSessionPage from '../pages/helper/HelperSessionPage';

function SeekerGuard({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'seeker') return <Navigate to="/" replace />;
  return children;
}

function HelperGuard({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== 'helper') return <Navigate to="/" replace />;
  return children;
}

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/onboarding/results', element: <OnboardingResultsPage /> },
  {
    path: '/dashboard',
    element: <SeekerGuard><SeekerDashboard /></SeekerGuard>,
  },
  {
    path: '/chat',
    element: <SeekerGuard><AIChatPage /></SeekerGuard>,
  },
  {
    path: '/professional-support',
    element: <SeekerGuard><ProfessionalSupportPage /></SeekerGuard>,
  },
  {
    path: '/session/:sessionId',
    element: <SeekerGuard><SessionPage /></SeekerGuard>,
  },
  {
    path: '/helper/dashboard',
    element: <HelperGuard><HelperDashboard /></HelperGuard>,
  },
  {
    path: '/helper/request/:requestId',
    element: <HelperGuard><RequestBriefPage /></HelperGuard>,
  },
  {
    path: '/helper/session/:sessionId',
    element: <HelperGuard><HelperSessionPage /></HelperGuard>,
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
