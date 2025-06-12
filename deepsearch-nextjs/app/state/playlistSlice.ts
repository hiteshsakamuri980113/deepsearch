import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { syncData, fetchPlaylists, fetchSongs } from "../utils/spotifyUtils";

// Types
export interface Playlist {
  _id?: string;
  playlistId: string;
  name: string;
  songs: string[];
}

export interface Song {
  _id?: string;
  songId: string;
  songName: string;
  artists: string[];
  genre: string[];
  playlistId: string;
  albumId: string;
  releaseYear: number;
  popularity: number;
  duration: number;
}

interface PlaylistState {
  items: Playlist[];
  selectedPlaylist: Playlist | null;
  loading: boolean;
  error: string | null;
  syncMessage: string | null;
  songs: Record<string, Song>; // Songs stored as object for easy lookup
}

const initialState: PlaylistState = {
  items: [],
  songs: {}, // Songs stored as object for easy lookup
  selectedPlaylist: null,
  loading: false,
  error: null,
  syncMessage: null,
};

// Async thunk for syncing and updating playlist data
export const syncAndUpdatePlaylists = createAsyncThunk(
  "playlists/syncAndUpdate",
  async (accessToken: string) => {
    await syncData(accessToken);
    const playlistsData = await fetchPlaylists();
    return playlistsData;
  }
);

// Async thunk for just fetching playlists
export const fetchPlaylistsThunk = createAsyncThunk(
  "playlists/fetch",
  async () => {
    const playlistsData = await fetchPlaylists();
    return playlistsData;
  }
);

// Async thunk for just fetching songs
export const fetchSongsThunk = createAsyncThunk(
  "playlists/fetchSongs",
  async (allSongIds: string[]) => {
    const songsData = await fetchSongs(allSongIds);
    return songsData;
  }
);

const playlistSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    setSelectedPlaylist: (state, action: PayloadAction<Playlist>) => {
      state.selectedPlaylist = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSyncMessage: (state) => {
      state.syncMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync and update playlists
      .addCase(syncAndUpdatePlaylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncAndUpdatePlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload as Playlist[];
        state.syncMessage = "Playlists synced successfully!";
      })
      .addCase(syncAndUpdatePlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to sync playlists";
      })
      // Fetch playlists
      .addCase(fetchPlaylistsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylistsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload as Playlist[];
      })
      .addCase(fetchPlaylistsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch playlists";
      })
      // Fetch songs
      .addCase(fetchSongsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSongsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Store songs in object format for easy lookup
        const songsObject: Record<string, Song> = {};
        action.payload.forEach((songDetail: unknown) => {
          // Map SongDetails to Song format
          const detail = songDetail as any; // Temporary cast for migration
          const song: Song = {
            songId: detail.id,
            songName: detail.name,
            artists: [detail.artist], // Convert single artist to array
            genre: [], // Will be filled from database
            playlistId: "", // Will be filled when needed
            albumId: detail.album || "",
            releaseYear: 0, // Will be filled from database
            popularity: detail.popularity || 0,
            duration: Math.floor(detail.duration_ms / 1000), // Convert ms to seconds
          };
          songsObject[song.songId] = song;
        });
        state.songs = { ...state.songs, ...songsObject };
      })
      .addCase(fetchSongsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch songs";
      });
  },
});

export const { setSelectedPlaylist, clearError, clearSyncMessage } =
  playlistSlice.actions;
export default playlistSlice.reducer;
