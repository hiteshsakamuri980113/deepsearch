import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Song from "@/models/song";

// GET /api/songs/[songId] - Get song by ID (exact Express logic)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await context.params;

    await dbConnect();

    // Find the song in the database by songId (exact Express logic)
    const song = await Song.findOne({ songId });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}
