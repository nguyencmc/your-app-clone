import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { notesService, Note } from "@/services/notesService";
import { authService } from "@/services";

export type { Note } from "@/services/notesService";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const data = await notesService.fetchNotes(user.id);
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (title: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const data = await notesService.createNote(user.id, title);

      toast({
        title: "Note Created",
        description: "Your note has been saved.",
      });

      await fetchNotes();
      return data;
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id);

      toast({
        title: "Note Deleted",
        description: "Your note has been removed.",
      });

      await fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  return {
    notes,
    isLoading,
    createNote,
    deleteNote,
    refetch: fetchNotes,
  };
}
