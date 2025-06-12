import { NextRequest, NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";
import dbConnect from "@/lib/mongodb";
import Playlist from "@/models/playlist";

// GET /api/playlists - Get all playlists
export async function GET() {
  try {
    await dbConnect();

    const playlists = await Playlist.find({});

    return NextResponse.json(playlists, { status: 200 });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Create playlist from top tracks
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("access_token");
    const { topTracks } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // Validate topTracks
    if (!Array.isArray(topTracks) || topTracks.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty topTracks array." },
        { status: 400 }
      );
    }

    // Ensure all tracks have valid URIs
    const validTracks = topTracks.filter((track: string) =>
      track.startsWith("spotify:track:")
    );
    if (validTracks.length === 0) {
      return NextResponse.json(
        { error: "No valid track URIs provided." },
        { status: 400 }
      );
    }

    const spotifyApi = getSpotifyApi();
    spotifyApi.setAccessToken(accessToken);

    // Create the playlist
    const playlistResponse = await spotifyApi.createPlaylist(
      "Top 10 Liked Songs",
      {
        description: "A playlist of your top 10 liked songs",
        public: false,
      }
    );

    const playlistId = playlistResponse.body.id;

    // Add tracks to the playlist
    await spotifyApi.addTracksToPlaylist(playlistId, validTracks);

    return NextResponse.json(
      { message: "Playlist created successfully!", playlistId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists - Delete playlist (exact Express logic)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("access_token");
    const { playlistId } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const spotifyApi = getSpotifyApi();
    spotifyApi.setAccessToken(accessToken);
    await spotifyApi.unfollowPlaylist(playlistId);

    return NextResponse.json(
      { message: "Playlist deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: "Failed to delete playlist" },
      { status: 500 }
    );
  }
}
