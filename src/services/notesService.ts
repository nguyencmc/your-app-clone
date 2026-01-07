import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export const notesService = {
  async fetchNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from("notes" as any)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as unknown as Note[]) || [];
  },

  async createNote(userId: string, title: string): Promise<Note> {
    const { data, error } = await supabase
      .from("notes" as any)
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Note;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from("notes" as any)
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
