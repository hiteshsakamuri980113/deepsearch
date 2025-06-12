import { NextRequest, NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";

// POST /api/playlists/spotify - Create Spotify playlist (exact Express logic)
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("access_token");
    const { name, songIds } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // Validate input (exact Express logic)
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing playlist name." },
        { status: 400 }
      );
    }
    if (!Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing song IDs." },
        { status: 400 }
      );
    }

    // Convert song IDs to Spotify track URIs (exact Express logic)
    const trackUris = songIds.map((id) => `spotify:track:${id}`);

    const spotifyApi = getSpotifyApi();
    spotifyApi.setAccessToken(accessToken);

    // Create the playlist (exact Express logic)
    const playlistResponse = await spotifyApi.createPlaylist(name, {
      description: "A playlist created using the DeepSearch app",
      public: false,
    });

    const playlistId = playlistResponse.body.id;

    // Add tracks to the playlist (exact Express logic)
    await spotifyApi.addTracksToPlaylist(playlistId, trackUris);

    return NextResponse.json({
      message: "Playlist created successfully!",
      playlistId,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);

    // Log Spotify API error details if available (exact Express logic)
    if ((error as Error).cause && typeof (error as Error).cause === "object") {
      console.error("Spotify API Error:", (error as Error).cause);
    }

    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
