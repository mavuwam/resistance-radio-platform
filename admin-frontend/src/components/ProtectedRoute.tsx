import { Navigate } from 'react-router-dom';
import { useAuth } from 'shared';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin role is required
  if (requireAdmin && user?.role !== 'content_manager' && user?.role !== 'administrator') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
