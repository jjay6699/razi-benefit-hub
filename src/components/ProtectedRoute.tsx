import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  hrAdminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false, hrAdminOnly = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/patient" replace />;
  }

  if (hrAdminOnly && profile?.role !== 'hr_admin') {
    return <Navigate to="/patient" replace />;
  }

  return <>{children}</>;
};