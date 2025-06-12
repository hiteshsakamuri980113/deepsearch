import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  songId: {
    type: String,
    trim: true,
    required: [true, "Song ID is required"],
  },
  songName: {
    type: String,
    trim: true,
    required: [true, "Song name is required"],
  },
  artists: {
    type: [String], // Array of artist names
    default: [],
  },
  genre: {
    type: [String], // Array of genres
    default: [],
  },
  playlistId: {
    type: String, // Reference to the playlist this song belongs to
    trim: true,
  },
  albumId: {
    type: String, // Reference to the album this song belongs to
    trim: true,
  },
  releaseYear: {
    type: Number, // Year the song was released
    default: null,
  },
  popularity: {
    type: Number, // Popularity score
    default: 0,
  },
  duration: {
    type: Number, // Duration of the song in seconds
    default: 0,
  },
});

export interface ISong {
  songId: string;
  songName: string;
  artists: string[];
  genre: string[];
  playlistId?: string;
  albumId?: string;
  releaseYear?: number;
  popularity: number;
  duration: number;
}

export default mongoose.models.Song ||
  mongoose.model<ISong>("Song", SongSchema);
