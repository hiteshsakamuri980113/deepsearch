import { NextRequest, NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";
import axios from "axios";

const revokeSpotifyTokens = async (accessToken: string) => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify credentials not configured");
    }

    // Spotify token revocation endpoint
    const revokeUrl = "https://accounts.spotify.com/api/token";

    // Make a POST request to revoke the token
    const response = await axios.post(
      revokeUrl,
      new URLSearchParams({
        token: accessToken,
        token_type_hint: "access_token",
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Token revoked successfully:", response.data);
  } catch (err: unknown) {
    const error = err as Error & { response?: { data: unknown } };
    console.error(
      "Error revoking Spotify token:",
      error.response?.data || error.message
    );
  }
};

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    const spotifyApi = getSpotifyApi();
    spotifyApi.setAccessToken("");
    spotifyApi.setRefreshToken("");

    if (accessToken) {
      console.log("Revoking token...");
      await revokeSpotifyTokens(accessToken);
    } else {
      console.error("No access token provided for revocation");
      return NextResponse.json(
        { error: "Access token is required for logout" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
