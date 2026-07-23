"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, Trash2, Edit3, Save, X, Download,
  Sparkles, FileText, Layers, HelpCircle, Brain, Filter,
  Clock, Tag, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

import { PageWrapper } from "../../components/layout/PageWrapper";
import { Container } from "../../components/layout/Container";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { RequireAuth } from "../../features/auth/components/RouteGuard";
import { useAuth } from "../../hooks/useAuth";
import { lmsHubsDb, SavedNote } from "../../lib/lmsHubsDb";
import { AiService } from "../../features/ai/services/aiService";
import { MarkdownViewer } from "../../features/ai/components/MarkdownViewer";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  notes: <FileText size={14} className="text-purple-400" />,
  quiz: <HelpCircle size={14} className="text-emerald-400" />,
  flashcards: <Layers size={14} className="text-rose-400" />,
  study: <Brain size={14} className="text-blue-400" />,
};

const MODULE_LABELS: Record<string, string> = {
  notes: "Study Notes",
  quiz: "Quiz",
  flashcards: "Flashcards",
  study: "Study",
};

// ─── Generate Dialog ──────────────────────────────────────────────────────────
function GenerateDialog({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (note: SavedNote) => void;
}) {
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [module, setModule] = useState<"notes" | "quiz" | "flashcards">("notes");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");

  const generate = async () => {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    setLoading(true);
    try {
      const text =
        module === "notes" ? await AiService.generateNotes(topic)
        : module === "quiz" ? await AiService.generateQuiz(topic)
        : await AiService.generateFlashcards(topic);
      setPreview(text);
      setTitle(`${MODULE_LABELS[module]}: ${topic}`);
    } catch {
      toast.error("AI generation failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !preview) return;
    try {
      const saved = await lmsHubsDb.saveNote(user.id, title, preview, module);
      onSave(saved);
      toast.success("Note saved to library!");
      onClose();
    } catch {
      toast.error("Failed to save note. Run the Supabase migration first.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl shadow-floating w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h2 className="text-sm font-heading font-bold text-foreground">✨ Generate with Sparky AI</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Module selector */}
          <div className="flex gap-2">
            {(["notes", "quiz", "flashcards"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModule(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  module === m
                    ? "bg-primary text-white border-primary"
                    : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {MODULE_ICONS[m]} {MODULE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Topic input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Topic *</label>
            <div className="flex gap-2">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder={`e.g. ${module === "notes" ? "Calculus Derivatives" : module === "quiz" ? "Python Lists" : "React Hooks"}`}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
              <Button onClick={generate} disabled={loading} size="sm" className="shrink-0">
                {loading ? "Thinking..." : "Generate"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {loading && (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground text-sm">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              ✨ Sparky is generating...
            </div>
          )}

          {preview && !loading && (
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                placeholder="Note title..."
              />
              <div className="bg-muted/40 border border-border/60 rounded-xl p-4 max-h-64 overflow-y-auto">
                <MarkdownViewer content={preview} />
              </div>
            </div>
          )}
        </div>

        {preview && !loading && (
          <div className="p-5 border-t border-border/50 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>
              <Save size={14} /> Save to Library
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Note Editor ──────────────────────────────────────────────────────────────
function NoteEditor({
  note,
  onSave,
  onClose,
}: {
  note: SavedNote;
  onSave: (updated: SavedNote) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await lmsHubsDb.updateNote(note.id, title, content);
      onSave(updated);
      toast.success("Note updated!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    const lines = content.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").split("\n");
    let y = 35;
    lines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 6;
    });
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF exported!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl shadow-floating w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-primary" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-heading font-bold text-foreground bg-transparent border-none outline-none w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                preview ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground"
              }`}
            >
              {preview ? "Edit" : "Preview"}
            </button>
            <Button size="sm" variant="ghost" onClick={handleExportPDF} className="gap-1">
              <Download size={13} /> PDF
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
              <Save size={13} /> {saving ? "Saving..." : "Save"}
            </Button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {preview ? (
            <div className="flex-1 overflow-y-auto p-6">
              <MarkdownViewer content={content} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none bg-transparent p-6 text-sm text-foreground/90 font-mono leading-relaxed focus:outline-none"
              spellCheck={false}
              placeholder="Write your notes in markdown..."
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Notes Library Page ──────────────────────────────────────────────────
export default function NotesLibraryPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [generating, setGenerating] = useState(false);
  const [editingNote, setEditingNote] = useState<SavedNote | null>(null);
  const [viewingNote, setViewingNote] = useState<SavedNote | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchNotes = useCallback(async (q?: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await lmsHubsDb.getNotes(user.id, q);
      setNotes(data);
    } catch {
      // Table may not exist yet — show empty state
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchNotes(val), 400);
  };

  const handleDelete = async (id: string) => {
    try {
      await lmsHubsDb.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleExportPDF = (note: SavedNote) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(note.title, 14, 20);
    doc.setFontSize(10);
    const lines = note.content.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").split("\n");
    let y = 35;
    lines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line || " ", 14, y);
      y += 6;
    });
    doc.save(`${note.title.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF exported!");
  };

  const filtered = notes.filter((n) =>
    filterModule === "all" ? true : n.module === filterModule
  );

  return (
    <RequireAuth>
      <PageWrapper>
        <section className="py-16 min-h-[80vh]">
          <Container className="max-w-6xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={22} className="text-primary" />
                  <h1 className="text-2xl font-heading font-extrabold text-foreground">Notes Library</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate, save, and manage your AI-powered study notes.
                </p>
              </div>
              <Button onClick={() => setGenerating(true)} className="gap-2 shrink-0">
                <Sparkles size={16} /> Generate New Notes
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "notes", "quiz", "flashcards", "study"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterModule(m)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      filterModule === m
                        ? "bg-primary text-white border-primary"
                        : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {m !== "all" && MODULE_ICONS[m]}
                    {m === "all" ? "All" : MODULE_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filtered.length === 0 ? (
              <Card variant="glass" className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-md mx-auto border-border bg-card shadow-premium mt-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-pulse">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-sm font-heading font-extrabold text-foreground mb-1.5">
                  {search ? "No matching notes found" : "Your study library is empty"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-xs">
                  {search 
                    ? "Try adjusting your search terms or filters to find what you're looking for." 
                    : "Generate detailed study summaries, flashcards, or practice quizzes using our AI study tools."}
                </p>
                <Button onClick={() => setGenerating(true)} size="sm" className="gap-1.5">
                  <Sparkles size={13} /> {search ? "Create New Notes" : "Generate your first note"}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filtered.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <Card
                        variant="default"
                        className="p-5 border-border bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-premium transition-all duration-300 group flex flex-col h-full cursor-pointer rounded-2xl"
                        onClick={() => setViewingNote(note)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 shrink-0">
                            {MODULE_ICONS[note.module] ?? <FileText size={14} />}
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              {MODULE_LABELS[note.module] ?? note.module}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setEditingNote(note)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleExportPDF(note)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="Export PDF"
                            >
                              <Download size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="p-1 rounded hover:bg-red-500/10 text-white/90 hover:text-red-400 transition"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2 flex-1">
                          {note.title}
                        </h3>

                        <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                          {note.content.replace(/#{1,6}\s|[\*_`]/g, "").slice(0, 150)}...
                        </p>

                        <div className="flex items-center gap-1 mt-auto text-[10px] text-muted-foreground">
                          <Clock size={11} />
                          {new Date(note.updated_at).toLocaleDateString()}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Container>
        </section>

        {/* Dialogs */}
        <AnimatePresence>
          {generating && (
            <GenerateDialog
              onClose={() => setGenerating(false)}
              onSave={(note) => setNotes((prev) => [note, ...prev])}
            />
          )}
          {editingNote && (
            <NoteEditor
              note={editingNote}
              onSave={(updated) => {
                setNotes((prev) => prev.map((n) => n.id === updated.id ? updated : n));
                setEditingNote(null);
              }}
              onClose={() => setEditingNote(null)}
            />
          )}
          {viewingNote && !editingNote && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setViewingNote(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl shadow-floating w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                  <h2 className="text-sm font-bold text-foreground">{viewingNote.title}</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingNote(viewingNote); setViewingNote(null); }} className="gap-1">
                      <Edit3 size={13} /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleExportPDF(viewingNote)} className="gap-1">
                      <Download size={13} /> PDF
                    </Button>
                    <button onClick={() => setViewingNote(null)} className="text-muted-foreground hover:text-foreground transition">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <MarkdownViewer content={viewingNote.content} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PageWrapper>
    </RequireAuth>
  );
}
