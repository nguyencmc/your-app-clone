import { useState, useEffect } from "react";
import { AppRole } from "@/types";
import { userService, authService } from "@/services";

export type { AppRole, UserRole } from "@/types";

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const userRoles = await userService.fetchUserRoles(user.id);
      setRoles(userRoles);
      setIsAdmin(userRoles.includes("admin"));
      setIsModerator(
        userRoles.includes("moderator") || userRoles.includes("admin")
      );
    } catch (error) {
      console.error("Error fetching user roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return {
    roles,
    isLoading,
    isAdmin,
    isModerator,
    hasRole,
    refetch: fetchUserRoles,
  };
}
