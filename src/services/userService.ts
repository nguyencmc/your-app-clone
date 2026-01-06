import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types";

export const userService = {
  async fetchUserRoles(userId: string): Promise<AppRole[]> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw error;
    return (data || []).map((r) => r.role as AppRole);
  },
};
