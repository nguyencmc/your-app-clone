import { ReactNode } from 'react';
import { usePermissionsContext, AppRole } from '@/contexts/PermissionsContext';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: AppRole;
  roles?: AppRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
  // For resource ownership checks
  resource?: string;
  creatorId?: string | null;
  action?: 'edit' | 'delete';
}

/**
 * Inline permission gate for conditional rendering without redirects
 * 
 * Usage:
 * <PermissionGate permission="users.delete">
 *   <DeleteButton />
 * </PermissionGate>
 * 
 * <PermissionGate resource="courses" creatorId={course.creator_id} action="edit">
 *   <EditButton />
 * </PermissionGate>
 */
export const PermissionGate = ({
  children,
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
  resource,
  creatorId,
  action,
}: PermissionGateProps) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasRole,
    canEditOwn,
    canDeleteOwn,
    loading 
  } = usePermissionsContext();

  // Don't render anything while loading to prevent flicker
  if (loading) {
    return null;
  }

  let hasAccess = false;

  // Check resource ownership-based permissions
  if (resource && action) {
    if (action === 'edit') {
      hasAccess = canEditOwn(resource, creatorId);
    } else if (action === 'delete') {
      hasAccess = canDeleteOwn(resource, creatorId);
    }
  }
  // Check single permission
  else if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check multiple permissions
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  }
  // Check single role
  else if (role) {
    hasAccess = hasRole(role);
  }
  // Check multiple roles
  else if (roles && roles.length > 0) {
    hasAccess = requireAll 
      ? roles.every(r => hasRole(r)) 
      : roles.some(r => hasRole(r));
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common use cases
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate role="admin" fallback={fallback}>{children}</PermissionGate>
);

export const TeacherOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate roles={['admin', 'teacher']} fallback={fallback}>{children}</PermissionGate>
);

export const ModeratorOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <PermissionGate roles={['admin', 'moderator']} fallback={fallback}>{children}</PermissionGate>
);
