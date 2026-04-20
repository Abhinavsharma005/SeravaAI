// components/dashboard/EvidenceSection.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Calendar,
  Upload,
  Image as ImageIcon,
  FileText,
  Brain,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  StickyNote,
  Eye,
  Loader2,
} from "lucide-react";

interface EvidenceEntry {
  _id: string;
  date: string;
  type: "summary" | "image" | "note";
  summary?: string;
  dominantEmotion?: string;
  stressLevel?: string;
  riskTrend?: string;
  imageUrl?: string;
  imageCaption?: string;
  note?: string;
  createdAt: string;
}

interface EvidenceSectionProps {
  uid: string;
}

// ── Helpers ──────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDateDisplay(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDaysInRange(centerDate: Date, range: number): string[] {
  const days: string[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    days.push(toDateKey(d));
  }
  return days;
}

function getStressColor(level: string): string {
  switch (level) {
    case "low":
      return "#10b981";
    case "medium":
      return "#f59e0b";
    case "high":
      return "#ef4444";
    default:
      return "#71717a";
  }
}

function getStressEmoji(level: string): string {
  switch (level) {
    case "low":
      return "😊";
    case "medium":
      return "😐";
    case "high":
      return "😰";
    default:
      return "📊";
  }
}

// ── Main Component ───────────────────────────────────────────────

export default function EvidenceSection({ uid }: EvidenceSectionProps) {
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [evidence, setEvidence] = useState<EvidenceEntry[]>([]);
  const [summaryMap, setSummaryMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [noteText, setNoteText] = useState("");
  const [globalEmotion, setGlobalEmotion] = useState("");
  const [globalStress, setGlobalStress] = useState(0);
  const [globalRiskTrend, setGlobalRiskTrend] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch Evidence ────────────────────────────────────────────
  const fetchEvidence = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/evidence?uid=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setEvidence(data.evidence || []);
        setSummaryMap(data.summaryMap || {});
        setGlobalEmotion(data.dominantEmotion || "");
        setGlobalStress(data.avgStress || 0);
        setGlobalRiskTrend(data.riskTrend || "");
      }
    } catch (err) {
      console.error("Failed to fetch evidence:", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  // ── Date Navigation ───────────────────────────────────────────
  const navigateDate = (direction: number) => {
    const current = new Date(selectedDate + "T12:00:00");
    current.setDate(current.getDate() + direction);
    const newDate = toDateKey(current);
    // Don't go into future
    if (newDate <= toDateKey(new Date())) {
      setSelectedDate(newDate);
    }
  };

  const visibleDays = getDaysInRange(
    new Date(selectedDate + "T12:00:00"),
    3
  ).filter((d) => d <= toDateKey(new Date()));

  // ── Filter Evidence for Selected Date ─────────────────────────
  const dayEvidence = evidence.filter((e) => e.date === selectedDate);
  const daySummary = summaryMap[selectedDate] || null;
  const dayImages = dayEvidence.filter((e) => e.type === "image");
  const dayNotes = dayEvidence.filter((e) => e.type === "note");

  // ── Days that have evidence (for dot indicators) ──────────────
  const daysWithEvidence = new Set(evidence.map((e) => e.date));
  const daysWithSummary = new Set(Object.keys(summaryMap));

  // ── Upload Image ──────────────────────────────────────────────
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get Cloudinary signature
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign: { timestamp } }),
      });
      const { signature } = await signRes.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "api_key",
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!
      );
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadRes.json();

      if (uploadData.secure_url) {
        // 3. Save evidence to DB
        const res = await fetch("/api/evidence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            date: selectedDate,
            type: "image",
            imageUrl: uploadData.secure_url,
            imageCaption: imageCaption,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setEvidence((prev) => [data.evidence, ...prev]);
          setImageCaption("");
          setShowUploadModal(false);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ── Save Note ─────────────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!noteText.trim()) return;

    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          date: selectedDate,
          type: "note",
          note: noteText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvidence((prev) => [data.evidence, ...prev]);
        setNoteText("");
        setShowNoteModal(false);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  // ── Delete Evidence ───────────────────────────────────────────
  const handleDelete = async (evidenceId: string) => {
    try {
      const res = await fetch("/api/evidence", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, evidenceId }),
      });

      if (res.ok) {
        setEvidence((prev) => prev.filter((e) => e._id !== evidenceId));
      }
    } catch (err) {
      console.error("Failed to delete evidence:", err);
    }
  };

  // ── Format Time ───────────────────────────────────────────────
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Loading State ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[500px] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#B21563] border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading evidence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Image Preview Modal ── */}
      {showImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <button
            onClick={() => setShowImagePreview(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={showImagePreview}
            alt="Evidence"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Upload Evidence
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setImageCaption("");
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-500 mb-4">
              Upload an image as evidence for{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {formatDateDisplay(selectedDate)}
              </span>
            </p>

            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Add a caption (optional)..."
              className="w-full mb-4 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#B21563] transition-colors"
            />

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#B21563] hover:bg-[#911050] text-white font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Choose Image
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setImageCaption("");
                }}
                className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Note Modal ── */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Add Evidence Note
              </h3>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteText("");
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-500 mb-4">
              Add a note for{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {formatDateDisplay(selectedDate)}
              </span>
            </p>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Describe what happened..."
              className="w-full mb-4 px-3 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#B21563] transition-colors resize-none min-h-[150px]"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#B21563] hover:bg-[#911050] text-white font-medium transition-colors disabled:opacity-50"
              >
                <StickyNote className="w-4 h-4" />
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteText("");
                }}
                className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#B21563]" />
            Evidence Vault
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Daily summaries, images & notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#B21563] hover:bg-[#911050] text-white text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <button
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <StickyNote className="w-4 h-4" />
            <span className="hidden sm:inline">Note</span>
          </button>
        </div>
      </div>

      {/* ── Date Picker ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {formatDateDisplay(selectedDate)}
          </h3>

          <button
            onClick={() => navigateDate(1)}
            disabled={selectedDate >= toDateKey(new Date())}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Pills */}
        <div className="flex gap-1.5 justify-center">
          {visibleDays.map((day) => {
            const isSelected = day === selectedDate;
            const isToday = day === toDateKey(new Date());
            const hasEvidence =
              daysWithEvidence.has(day) || daysWithSummary.has(day);
            const dayNum = new Date(day + "T12:00:00").getDate();
            const dayName = new Date(day + "T12:00:00").toLocaleDateString(
              "en-US",
              { weekday: "short" }
            );

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200
                  ${
                    isSelected
                      ? "bg-[#B21563] text-white shadow-lg shadow-[#B21563]/20"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }
                `}
              >
                <span className="text-[10px] font-medium uppercase">
                  {dayName}
                </span>
                <span className="text-sm font-bold">{dayNum}</span>
                {isToday && !isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#B21563]" />
                )}
                {hasEvidence && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── AI Summary Card ── */}
      {daySummary && (
        <div className="bg-gradient-to-br from-[#B21563]/5 to-transparent dark:from-[#B21563]/10 rounded-2xl border border-[#B21563]/20 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#B21563]/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#B21563]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  AI Daily Summary
                </h3>
                <p className="text-xs text-zinc-500">
                  {formatDateDisplay(selectedDate)}
                </p>
              </div>
            </div>

            {/* Stress Badge */}
            <div className="flex items-center gap-2">
              {globalEmotion && (
                <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {globalEmotion}
                </span>
              )}
              {globalRiskTrend && (
                <div className="flex items-center gap-1">
                  {globalRiskTrend === "increasing" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                  ) : globalRiskTrend === "decreasing" ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {daySummary}
          </p>

          {/* Stress Indicator */}
          {globalStress > 0 && (
            <div className="mt-4 pt-3 border-t border-[#B21563]/10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-500">
                  Average Stress
                </span>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: getStressColor(
                      globalStress > 70
                        ? "high"
                        : globalStress > 40
                        ? "medium"
                        : "low"
                    ),
                  }}
                >
                  {Math.round(globalStress)}%{" "}
                  {getStressEmoji(
                    globalStress > 70
                      ? "high"
                      : globalStress > 40
                      ? "medium"
                      : "low"
                  )}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(globalStress, 100)}%`,
                    backgroundColor: getStressColor(
                      globalStress > 70
                        ? "high"
                        : globalStress > 40
                        ? "medium"
                        : "low"
                    ),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── No Summary Placeholder ── */}
      {!daySummary && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Brain className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500">
                No AI summary for this day
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Chat with the AI to generate mood analysis
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Images Section ── */}
      {dayImages.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-[#B21563]" />
            Uploaded Evidence ({dayImages.length})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dayImages.map((img) => (
              <div
                key={img._id}
                className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square bg-zinc-100 dark:bg-zinc-800"
              >
                <img
                  src={img.imageUrl}
                  alt={img.imageCaption || "Evidence"}
                  className="w-full h-full object-cover"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() =>
                      setShowImagePreview(img.imageUrl || null)
                    }
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="p-2 rounded-full bg-red-500/20 backdrop-blur-sm text-red-300 hover:bg-red-500/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Caption */}
                {img.imageCaption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-[11px] text-white line-clamp-2">
                      {img.imageCaption}
                    </p>
                  </div>
                )}

                {/* Time badge */}
                <span className="absolute top-2 right-2 text-[9px] bg-black/40 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">
                  {formatTime(img.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Notes Section ── */}
      {dayNotes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-4">
            <StickyNote className="w-4 h-4 text-[#B21563]" />
            Evidence Notes ({dayNotes.length})
          </h3>

          <div className="space-y-3">
            {dayNotes.map((n) => (
              <div
                key={n._id}
                className="group flex items-start gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {n.note}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-2">
                    {formatTime(n.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State for No Evidence ── */}
      {!daySummary && dayImages.length === 0 && dayNotes.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500">
                No evidence for this day
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Upload images or add notes to document evidence. AI summaries
                appear automatically after chatbot sessions.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B21563] hover:bg-[#911050] text-white text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <StickyNote className="w-4 h-4" />
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Security Notice ── */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          All evidence is encrypted and stored securely. Only you can access
          your evidence vault.
        </p>
      </div>
    </div>
  );
}