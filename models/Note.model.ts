// models/Note.model.ts

import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    noteId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Untitled",
    },
    content: {
      type: String,
      default: "",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ userId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, noteId: 1 }, { unique: true });

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
export default Note;