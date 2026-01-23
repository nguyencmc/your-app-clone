import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissionsContext, AppRole } from '@/contexts/PermissionsContext';
import { Loader2 } from 'lucide-react';

interface RequirePermissionProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: AppRole;
  roles?: AppRole[];
  requireAll?: boolean; // For multiple permissions/roles, require all or any
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Component to protect routes/content based on permissions or roles
 * 
 * Usage:
 * <RequirePermission permission="exams.create">
 *   <CreateExamButton />
 * </RequirePermission>
 * 
 * <RequirePermission roles={['admin', 'teacher']} redirectTo="/">
 *   <AdminPage />
 * </RequirePermission>
 */
export const RequirePermission = ({
  children,
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
  redirectTo,
}: RequirePermissionProps) => {
  const location = useLocation();
  const { 
    loading, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasRole 
  } = usePermissionsContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  
  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  }

  // Check single role
  if (role) {
    hasAccess = hasRole(role);
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    hasAccess = requireAll 
      ? roles.every(r => hasRole(r)) 
      : roles.some(r => hasRole(r));
  }

  if (!hasAccess) {
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// HOC version for class components or when you prefer HOC pattern
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<RequirePermissionProps, 'children'>
) {
  return function PermissionWrapper(props: P) {
    return (
      <RequirePermission {...options}>
        <WrappedComponent {...props} />
      </RequirePermission>
    );
  };
}
