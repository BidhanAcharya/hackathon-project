import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { router } from './router';

export default function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <RouterProvider router={router} />
      </OnboardingProvider>
    </AuthProvider>
  );
}
