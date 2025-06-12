import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Playlist from "@/models/playlist";

// GET /api/playlists/[playlistId] - Get playlist by ID (exact Express logic)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ playlistId: string }> }
) {
  try {
    const { playlistId } = await context.params;

    await dbConnect();

    // Find the playlist in the database by playlistId (exact Express logic)
    const playlist = await Playlist.findOne({ playlistId }).populate("songs");

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}
