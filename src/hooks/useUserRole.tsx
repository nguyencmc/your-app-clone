import { usePermissionsContext, AppRole } from '@/contexts/PermissionsContext';

// Re-export AppRole for backwards compatibility
export type { AppRole };

interface UserRoleResult {
  roles: AppRole[];
  isAdmin: boolean;
  isTeacher: boolean;
  isModerator: boolean;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
}

/**
 * @deprecated Use usePermissionsContext or useRBAC from PermissionsContext instead
 * This hook is kept for backwards compatibility
 */
export const useUserRole = (): UserRoleResult => {
  const context = usePermissionsContext();
  
  return {
    roles: context.roles,
    isAdmin: context.isAdmin,
    isTeacher: context.isTeacher,
    isModerator: context.isModerator,
    loading: context.loading,
    hasRole: context.hasRole,
  };
};
