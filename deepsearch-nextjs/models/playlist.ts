import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  playlistId: {
    type: String,
    trim: true,
    required: [true, "Playlist ID is required"],
  },
  name: {
    type: String,
    trim: true,
    required: [true, "Playlist name is required"],
  },
  songs: {
    type: [String], // Array of song IDs
    default: [],
  },
});

export interface IPlaylist {
  playlistId: string;
  name: string;
  songs: string[];
}

export default mongoose.models.Playlist ||
  mongoose.model<IPlaylist>("Playlist", PlaylistSchema);
