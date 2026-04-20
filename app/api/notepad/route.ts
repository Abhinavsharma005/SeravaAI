// app/api/notepad/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note.model";

/**
 * GET /api/notepad?uid=<firebase_uid>
 * Returns all notes for a user
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notes = await Note.find({ userId: user._id })
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error("GET /api/notepad error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/notepad
 * Body: { uid, noteId, title?, content?, isPinned? }
 * Creates or updates a note
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, noteId, title, content, isPinned } = body;

    if (!uid || !noteId) {
      return NextResponse.json(
        { error: "Missing required fields (uid, noteId)" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateObj: any = {};
    if (title !== undefined) updateObj.title = title;
    if (content !== undefined) updateObj.content = content;
    if (isPinned !== undefined) updateObj.isPinned = isPinned;

    const note = await Note.findOneAndUpdate(
      { userId: user._id, noteId },
      { $set: updateObj },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error("POST /api/notepad error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/notepad
 * Body: { uid, noteId }
 * Deletes a note
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { uid, noteId } = body;

    if (!uid || !noteId) {
      return NextResponse.json(
        { error: "Missing required fields (uid, noteId)" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await Note.findOneAndDelete({ userId: user._id, noteId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/notepad error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}