import { NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";

const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email",
];

export async function GET() {
  try {
    const spotifyApi = getSpotifyApi();

    console.log("access token in spotify api:", spotifyApi.getAccessToken());
    console.log("refresh token in spotify api:", spotifyApi.getRefreshToken());

    const authUrl = spotifyApi.createAuthorizeURL(scopes, "your_state_value");

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error in Spotify auth:", error);
    return NextResponse.json(
      { error: "Failed to create authorization URL" },
      { status: 500 }
    );
  }
}
