import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;

      const userRoles = (data || []).map((r) => r.role as AppRole);
      setRoles(userRoles);
      setIsAdmin(userRoles.includes("admin"));
      setIsModerator(userRoles.includes("moderator") || userRoles.includes("admin"));
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
    refetch: fetchUserRoles 
  };
}