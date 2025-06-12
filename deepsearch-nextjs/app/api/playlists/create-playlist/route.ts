import { NextRequest, NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  try {
    // Get access token from query parameters
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("access_token");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, songIds } = body;

    // Validate input
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

    // Convert song IDs to Spotify track URIs
    const trackUris = songIds.map((id: string) => `spotify:track:${id}`);

    // Get Spotify API client and set access token
    const spotifyApi = getSpotifyApi();
    spotifyApi.setAccessToken(accessToken);

    // Create the playlist
    const playlistResponse = await spotifyApi.createPlaylist(name, {
      description: "A playlist created using the DeepSearch app",
      public: false,
    });

    const playlistId = playlistResponse.body.id;

    // Add tracks to the playlist
    await spotifyApi.addTracksToPlaylist(playlistId, trackUris);

    return NextResponse.json({
      message: "Playlist created successfully!",
      playlistId,
    });
  } catch (error: any) {
    console.error("Error creating playlist:", error);

    // Log Spotify API error details if available
    if (error.body && error.body.error) {
      console.error("Spotify API Error:", error.body.error);
    }

    return NextResponse.json(
      { error: "Failed to create playlist." },
      { status: 500 }
    );
  }
}
