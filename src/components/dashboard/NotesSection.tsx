import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, FileText } from "lucide-react";

export default function NotesSection() {
  const { notes, isLoading, createNote, deleteNote } = useNotes();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    setIsCreating(true);
    try {
      await createNote(newNoteTitle.trim());
      setNewNoteTitle("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Note Form */}
        <form onSubmit={handleCreateNote} className="flex gap-2">
          <Input
            placeholder="Add a new note..."
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isCreating || !newNoteTitle.trim()}>
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Notes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notes yet. Create your first note above!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50"
              >
                <span className="text-foreground">{note.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
