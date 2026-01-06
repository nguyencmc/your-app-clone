import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  onAuthStateChange(
    callback: (user: User | null) => void
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  },
};
