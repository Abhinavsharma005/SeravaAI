// app/notepad/page.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  LogOut,
  FileText,
  X,
  Menu,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";

interface NoteData {
  noteId: string;
  title: string;
  content: string;
  isPinned: boolean;
  updatedAt: string;
}

export default function NotepadPage() {
  const router = useRouter();

  // Auth
  const [uid, setUid] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Notes
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Stealth detection
  const [editorContent, setEditorContent] = useState("");
  const [editorTitle, setEditorTitle] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Auth Check ──────────────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/authpage");
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid }),
        });

        if (!res.ok) {
          router.push("/authpage");
          return;
        }

        const data = await res.json();

        if (!data.user.isProfileComplete) {
          router.push("/profile");
          return;
        }

        // If no secret key, user shouldn't be on notepad
        if (!data.user.secretKey) {
          router.push("/dashboard");
          return;
        }

        setUid(user.uid);
        setSecretKey(data.user.secretKey);
      } catch {
        router.push("/authpage");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ── Default sidebar closed on mobile ──────────────────────────
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // ── Fetch Notes ───────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    if (!uid) return;
    try {
      const res = await fetch(`/api/notepad?uid=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }, [uid]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Stealth Detection ─────────────────────────────────────────
  useEffect(() => {
    if (!secretKey || !editorContent) return;

    const trigger = `{${secretKey}}`;
    if (editorContent.includes(trigger)) {
      // Remove the trigger from content before saving
      const cleanContent = editorContent.replace(trigger, "");
      setEditorContent(cleanContent);

      // Save cleaned content
      if (activeNoteId && uid) {
        fetch("/api/notepad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            noteId: activeNoteId,
            content: cleanContent,
          }),
        }).catch(() => {});
      }

      // ── Set stealth unlock flag ──  ← ⚠️ ADD THIS LINE
      sessionStorage.setItem("serava_unlocked", "true");

      // Navigate to dashboard
      router.push("/dashboard");
    }
  }, [editorContent, secretKey, activeNoteId, uid, router]);
  // ── Auto-save with debounce ───────────────────────────────────
  const saveNote = useCallback(
    async (noteId: string, title: string, content: string) => {
      if (!uid) return;
      try {
        await fetch("/api/notepad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, noteId, title, content }),
        });
      } catch (err) {
        console.error("Failed to save note:", err);
      }
    },
    [uid]
  );

  const debouncedSave = useCallback(
    (noteId: string, title: string, content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(noteId, title, content);

        // Update local state
        setNotes((prev) =>
          prev.map((n) =>
            n.noteId === noteId
              ? { ...n, title, content, updatedAt: new Date().toISOString() }
              : n
          )
        );
      }, 800);
    },
    [saveNote]
  );

  // ── Handle Content Change ─────────────────────────────────────
  const handleContentChange = (value: string) => {
    setEditorContent(value);
    if (activeNoteId) {
      debouncedSave(activeNoteId, editorTitle, value);
    }
  };

  const handleTitleChange = (value: string) => {
    setEditorTitle(value);
    if (activeNoteId) {
      debouncedSave(activeNoteId, value, editorContent);
    }
  };

  // ── Create New Note ───────────────────────────────────────────
  const createNewNote = async () => {
    const newId = Date.now().toString();
    const newNote: NoteData = {
      noteId: newId,
      title: "Untitled",
      content: "",
      isPinned: false,
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newId);
    setEditorTitle("Untitled");
    setEditorContent("");

    if (uid) {
      fetch("/api/notepad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, noteId: newId, title: "Untitled", content: "" }),
      }).catch(() => {});
    }

    // Focus on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // ── Select Note ───────────────────────────────────────────────
  const selectNote = (note: NoteData) => {
    // Save current note before switching
    if (activeNoteId && uid) {
      saveNote(activeNoteId, editorTitle, editorContent);
    }

    setActiveNoteId(note.noteId);
    setEditorTitle(note.title);
    setEditorContent(note.content);

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // ── Delete Note ───────────────────────────────────────────────
  const deleteNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.noteId !== noteId));

    if (activeNoteId === noteId) {
      setActiveNoteId(null);
      setEditorTitle("");
      setEditorContent("");
    }

    if (uid) {
      fetch("/api/notepad", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, noteId }),
      }).catch(() => {});
    }
  };

  // ── Pin/Unpin Note ────────────────────────────────────────────
  const togglePin = async (noteId: string) => {
    const note = notes.find((n) => n.noteId === noteId);
    if (!note) return;

    const newPinned = !note.isPinned;

    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.noteId === noteId ? { ...n, isPinned: newPinned } : n
      );
      // Sort: pinned first, then by updatedAt
      return updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });

    if (uid) {
      fetch("/api/notepad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, noteId, isPinned: newPinned }),
      }).catch(() => {});
    }
  };

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = async () => {
    // Save current note before logout
    if (activeNoteId && uid) {
      await saveNote(activeNoteId, editorTitle, editorContent);
    }
    const auth = getAuth(app);
    await signOut(auth);
    router.push("/");
  };

  // ── Filter Notes ──────────────────────────────────────────────
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Format Date ───────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // ── Word Count ────────────────────────────────────────────────
  const wordCount = editorContent
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const charCount = editorContent.length;

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FileText className="w-8 h-8 text-zinc-500 animate-pulse" />
          <p className="text-zinc-500 text-sm">Loading notes...</p>
        </div>
      </div>
    );
  }

  // ── Active Note Object ────────────────────────────────────────
  const activeNote = notes.find((n) => n.noteId === activeNoteId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans">

      {/* ── Sidebar ── */}
      <div
        className={`
          ${sidebarOpen
            ? "w-full absolute inset-0 z-20 bg-[#0a0a0a]"
            : "w-0 md:w-0"
          }
          md:relative ${sidebarOpen ? "md:w-72" : "md:w-0"}
          flex-shrink-0 border-r border-zinc-800/50 flex flex-col transition-all duration-300 overflow-hidden
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-zinc-400" />
              <h1 className="text-lg font-semibold text-zinc-200">Notes</h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="Search notes..."
            />
          </div>

          {/* New Note Button */}
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <FileText className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm text-center">
                {searchQuery ? "No matching notes" : "No notes yet"}
              </p>
              {!searchQuery && (
                <button
                  onClick={createNewNote}
                  className="mt-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.noteId}
                  onClick={() => selectNote(note)}
                  className={`
                    group relative px-3 py-3 rounded-lg cursor-pointer transition-all duration-150
                    ${activeNoteId === note.noteId
                      ? "bg-zinc-800 border border-zinc-700/50"
                      : "hover:bg-zinc-800/50 border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {note.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {note.title || "Untitled"}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                        {note.content || "Empty note"}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-1.5">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(note.noteId);
                        }}
                        className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title={note.isPinned ? "Unpin" : "Pin"}
                      >
                        {note.isPinned ? (
                          <PinOff className="w-3.5 h-3.5" />
                        ) : (
                          <Pin className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.noteId);
                        }}
                        className="p-1.5 rounded-md hover:bg-red-900/30 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-600 text-center">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Main Editor ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {activeNoteId && (
              <div className="flex items-center gap-2">
                {activeNote?.isPinned && (
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="text-xs text-zinc-500">
                  {activeNote ? formatDate(activeNote.updatedAt) : ""}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activeNoteId && (
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-600 border-r border-zinc-800/50 pr-4">
                <span>{wordCount} words</span>
                <span>{charCount} chars</span>
              </div>
            )}
            
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-[#0a0a0a] text-xs font-bold transition-all shadow-sm hover:shadow-white/10"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Help
            </button>
          </div>
        </div>

        {/* Editor Body */}
        {activeNoteId ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Title Input */}
            <input
              type="text"
              value={editorTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title..."
              className="w-full px-6 pt-6 pb-2 bg-transparent text-2xl font-bold text-zinc-100 placeholder:text-zinc-700 focus:outline-none"
            />

            {/* Content Textarea */}
            <textarea
              ref={textareaRef}
              value={editorContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing..."
              className="flex-1 w-full px-6 py-2 bg-transparent text-zinc-300 placeholder:text-zinc-700 resize-none focus:outline-none leading-relaxed text-[15px]"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <FileText className="w-12 h-12 text-zinc-800" />
            <div className="text-center">
              <p className="text-zinc-500 text-sm font-medium">
                Select a note or create a new one
              </p>
              <p className="text-zinc-600 text-xs mt-1">
                Your thoughts, your space
              </p>
            </div>
            <button
              onClick={createNewNote}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        )}
      </div>

      {/* ── Help Popup Modal ── */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-zinc-100">
                    <HelpCircle className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 tracking-tight">Stealth Navigation</h3>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  To navigate back to your dashboard from this notepad, simply type or paste your <span className="text-zinc-100 font-bold">Secret Key</span> inside curly brackets anywhere in your notes.
                </p>
                
                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Trigger Format</p>
                  <code className="block text-lg font-mono text-white">
                    {`{`}your_secret_key{`}`}
                  </code>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-amber-200/80 leading-snug">
                    Once detected, the app will automatically clean the key and redirect you to the main dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-800/30 border-t border-zinc-800">
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-[#0a0a0a] text-sm font-bold transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}