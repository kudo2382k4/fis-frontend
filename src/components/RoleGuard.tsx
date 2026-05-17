import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Route này chỉ OWNER mới vào được */
  ownerOnly?: boolean;
  /** Nếu bị chặn thì redirect đến đâu, mặc định '/sales' */
  redirectTo?: string;
}

export function RoleGuard({ children, ownerOnly = false, redirectTo = '/sales' }: Props) {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'ROLE_OWNER';

  if (ownerOnly && !isOwner) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
