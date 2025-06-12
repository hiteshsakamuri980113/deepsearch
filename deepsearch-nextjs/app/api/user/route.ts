import { NextRequest, NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("access_token");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const spotifyApi = getSpotifyApi();
    spotifyApi.setAccessToken(accessToken);

    const userDetails = await spotifyApi.getMe();

    console.log("userDetails: ", userDetails);

    return NextResponse.json(userDetails.body, { status: 200 });
  } catch (error) {
    console.error("Error fetching Spotify user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details from Spotify" },
      { status: 500 }
    );
  }
}
