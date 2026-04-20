// models/Evidence.model.ts

import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    type: {
      type: String,
      enum: ["summary", "image", "note"],
      required: true,
    },
    // For AI summaries
    summary: {
      type: String,
      default: "",
    },
    dominantEmotion: {
      type: String,
      default: "",
    },
    stressLevel: {
      type: String,
      default: "",
    },
    riskTrend: {
      type: String,
      default: "",
    },
    // For images
    imageUrl: {
      type: String,
      default: "",
    },
    imageCaption: {
      type: String,
      default: "",
    },
    // For notes
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

evidenceSchema.index({ userId: 1, date: -1 });
evidenceSchema.index({ userId: 1, type: 1, date: -1 });

const Evidence =
  mongoose.models.Evidence || mongoose.model("Evidence", evidenceSchema);
export default Evidence;