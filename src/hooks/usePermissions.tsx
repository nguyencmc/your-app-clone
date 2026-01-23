import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Permission {
  permission_name: string;
  permission_category: string;
}

interface PermissionsResult {
  permissions: Permission[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canEditOwn: (resource: string, creatorId?: string | null) => boolean;
  canDeleteOwn: (resource: string, creatorId?: string | null) => boolean;
  refetch: () => Promise<void>;
}

export const usePermissions = (): PermissionsResult => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_user_permissions', { _user_id: user.id });

      if (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } else {
        setPermissions(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const permissionNames = useMemo(() => 
    new Set(permissions.map(p => p.permission_name)),
    [permissions]
  );

  const hasPermission = useCallback((permission: string): boolean => {
    return permissionNames.has(permission);
  }, [permissionNames]);

  const hasAnyPermission = useCallback((perms: string[]): boolean => {
    return perms.some(p => permissionNames.has(p));
  }, [permissionNames]);

  const hasAllPermissions = useCallback((perms: string[]): boolean => {
    return perms.every(p => permissionNames.has(p));
  }, [permissionNames]);

  const canEditOwn = useCallback((resource: string, creatorId?: string | null): boolean => {
    // If user has full edit permission, allow
    if (hasPermission(`${resource}.edit`)) return true;
    // If user has edit_own permission and is the creator
    if (hasPermission(`${resource}.edit_own`) && creatorId === user?.id) return true;
    return false;
  }, [hasPermission, user?.id]);

  const canDeleteOwn = useCallback((resource: string, creatorId?: string | null): boolean => {
    // If user has full delete permission, allow
    if (hasPermission(`${resource}.delete`)) return true;
    // If user has delete_own permission and is the creator
    if (hasPermission(`${resource}.delete_own`) && creatorId === user?.id) return true;
    return false;
  }, [hasPermission, user?.id]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canEditOwn,
    canDeleteOwn,
    refetch: fetchPermissions,
  };
};
