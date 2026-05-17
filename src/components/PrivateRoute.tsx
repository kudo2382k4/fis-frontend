import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function PrivateRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
