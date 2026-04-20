// app/api/evidence/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Evidence from "@/models/Evidence.model";

/**
 * GET /api/evidence?uid=<firebase_uid>&date=<YYYY-MM-DD>(optional)
 * Returns evidence entries for a user, optionally filtered by date
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const date = searchParams.get("date");

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const query: any = { userId: user._id };
    if (date) {
      query.date = date;
    }

    const evidence = await Evidence.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Also fetch summaryMap from user for AI summaries
    const summaryMap = user.summaryMap
      ? Object.fromEntries(user.summaryMap)
      : {};

    return NextResponse.json({
      success: true,
      evidence,
      summaryMap,
      dominantEmotion: user.dominantEmotion || "",
      avgStress: user.avgStress || 0,
      riskTrend: user.riskTrend || "",
    });
  } catch (error: any) {
    console.error("GET /api/evidence error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/evidence
 * Body: { uid, date, type, imageUrl?, imageCaption?, note? }
 * Creates a new evidence entry
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, date, type, imageUrl, imageCaption, note } = body;

    if (!uid || !date || !type) {
      return NextResponse.json(
        { error: "Missing required fields (uid, date, type)" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const evidenceData: any = {
      userId: user._id,
      date,
      type,
    };

    if (type === "image") {
      if (!imageUrl) {
        return NextResponse.json(
          { error: "Image URL is required for image evidence" },
          { status: 400 }
        );
      }
      evidenceData.imageUrl = imageUrl;
      evidenceData.imageCaption = imageCaption || "";
    }

    if (type === "note") {
      evidenceData.note = note || "";
    }

    if (type === "summary") {
      // Pull from user's summaryMap
      const summaryText = user.summaryMap?.get(date) || "";
      evidenceData.summary = summaryText;
      evidenceData.dominantEmotion = user.dominantEmotion || "";
      evidenceData.stressLevel =
        user.avgStress > 70 ? "high" : user.avgStress > 40 ? "medium" : "low";
      evidenceData.riskTrend = user.riskTrend || "";
    }

    const evidence = await Evidence.create(evidenceData);

    return NextResponse.json({ success: true, evidence });
  } catch (error: any) {
    console.error("POST /api/evidence error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/evidence
 * Body: { uid, evidenceId }
 * Deletes an evidence entry
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { uid, evidenceId } = body;

    if (!uid || !evidenceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Evidence.findOneAndDelete({
      _id: evidenceId,
      userId: user._id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/evidence error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}