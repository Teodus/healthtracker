import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireOnboarding = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading spinner while checking auth status
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireOnboarding && user && !user.onboardingCompleted) {
    // Redirect to onboarding if not completed
    return <Navigate to="/goals" replace />;
  }

  if (!requireOnboarding && user && !user.onboardingCompleted && location.pathname !== '/goals') {
    // Redirect to onboarding for users who haven't completed it
    return <Navigate to="/goals" replace />;
  }

  return <>{children}</>;
};