import { NextRequest, NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const spotifyApi = getSpotifyApi();
    const data = await spotifyApi.authorizationCodeGrant(code);

    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;

    // Save tokens for future use
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    console.log("refresh_token: ", refreshToken);

    // Redirect to frontend with tokens
    const redirectUrl = new URL(
      "/new-search",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    );
    redirectUrl.searchParams.set("access_token", accessToken);
    redirectUrl.searchParams.set("refresh_token", refreshToken);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error during Spotify authorization:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Spotify" },
      { status: 500 }
    );
  }
}
