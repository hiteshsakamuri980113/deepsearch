// Spotify utility functions for Next.js app

interface SyncDataResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

interface SongDetails {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  popularity: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
}

interface UserResponse {
  id: string;
  display_name: string;
  email: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

interface SpotifyPlaylistResponse {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

interface TokenData {
  access_token: string;
  refresh_token: string | null;
  expires_in?: number;
}

export const syncData = async (
  accessToken: string
): Promise<SyncDataResponse> => {
  if (!accessToken) {
    alert("Please log in first!");
    throw new Error("No access token provided");
  }

  try {
    const response = await fetch(
      `/api/playlists/sync?access_token=${accessToken}`
    );
    const data: SyncDataResponse = await response.json();
    console.log("Sync data response:", data);
    return data;
  } catch (error) {
    console.error("Error syncing data:", error);
    throw error;
  }
};

export const fetchPlaylists = async (): Promise<unknown[]> => {
  try {
    const response = await fetch("/api/playlists");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: unknown[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error;
  }
};

export const fetchSongs = async (songIds: string[]): Promise<SongDetails[]> => {
  try {
    const songDetails = await Promise.all(
      songIds.map(async (songId: string): Promise<SongDetails> => {
        const response = await fetch(`/api/songs/${songId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { id: songId, ...data };
      })
    );

    return songDetails;
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
};

export const fetchUser = async (accessToken: string): Promise<UserResponse> => {
  try {
    const response = await fetch(`/api/user?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: UserResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const createSpotifyPlaylist = async (
  accessToken: string,
  name: string,
  songIds: string[]
): Promise<SpotifyPlaylistResponse> => {
  try {
    const response = await fetch(
      `/api/playlists/spotify?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, songIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SpotifyPlaylistResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating Spotify playlist:", error);
    throw error;
  }
};

export const sendDataToPythonBackend = async (
  tokenData: TokenData
): Promise<unknown> => {
  try {
    const pythonAgentUrl =
      process.env.PYTHON_AGENT_URL || "http://localhost:8000";
    const response = await fetch(`${pythonAgentUrl}/api/spotify-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tokenData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Tokens sent to Python backend:", data);
    return data;
  } catch (error) {
    console.error("Error sending tokens to Python backend:", error);
    throw error;
  }
};
