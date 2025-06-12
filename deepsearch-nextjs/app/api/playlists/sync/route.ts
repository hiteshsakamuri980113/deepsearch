import { NextRequest, NextResponse } from "next/server";
import { getSpotifyApi } from "@/lib/spotify";
import dbConnect from "@/lib/mongodb";
import Playlist from "@/models/playlist";
import Song from "@/models/song";

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

    // Connect to database
    await dbConnect();

    // Step 1: Fetch playlists from Spotify
    const spotifyApi = getSpotifyApi();
    spotifyApi.setAccessToken(accessToken);
    const spotifyPlaylistsResponse = await spotifyApi.getUserPlaylists();
    const spotifyPlaylists = spotifyPlaylistsResponse.body.items;

    // Step 2: Fetch all playlists from MongoDB
    const dbPlaylists = await Playlist.find({});
    const dbPlaylistsMap = new Map(dbPlaylists.map((p) => [p.playlistId, p]));

    // Step 3: Sync playlists (create or delete)
    const spotifyPlaylistIds = spotifyPlaylists.map(
      (playlist: SpotifyApi.PlaylistObjectSimplified) => playlist.id
    );

    // Create or update playlists in MongoDB
    for (const spotifyPlaylist of spotifyPlaylists) {
      const { id: playlistId, name } = spotifyPlaylist;

      if (dbPlaylistsMap.has(playlistId)) {
        // Update existing playlist in MongoDB
        const dbPlaylist = dbPlaylistsMap.get(playlistId);
        dbPlaylist.name = name; // Update name if it has changed
        await dbPlaylist.save();
      } else {
        // Create new playlist in MongoDB
        const newPlaylist = new Playlist({
          playlistId,
          name,
          songs: [], // Initialize with an empty songs array
        });
        await newPlaylist.save();
      }
    }

    // Delete playlists from MongoDB that are no longer in Spotify
    for (const dbPlaylist of dbPlaylists) {
      if (!spotifyPlaylistIds.includes(dbPlaylist.playlistId)) {
        await Playlist.findByIdAndDelete(dbPlaylist._id);
      }
    }

    // Step 4: Fetch tracks for each playlist and update MongoDB
    const updatedPlaylists = await Playlist.find({});
    for (const playlist of updatedPlaylists) {
      const playlistId = playlist.playlistId;

      // Fetch tracks for the playlist from Spotify
      const tracksResponse = await spotifyApi.getPlaylistTracks(playlistId);
      const trackIds = tracksResponse.body.items
        .filter((item: SpotifyApi.PlaylistTrackObject) => item.track)
        .map((item: SpotifyApi.PlaylistTrackObject) => item.track!.id);

      // Update the songs array in MongoDB
      playlist.songs = trackIds;
      await playlist.save();

      for (const trackId of trackIds) {
        // Check if the song already exists in the songs collection
        const existingSong = await Song.findOne({ songId: trackId });
        if (existingSong) {
          // Fetch song details from Spotify to get the updated popularity and duration
          const songData = await spotifyApi.getTrack(trackId);
          const { popularity, duration_ms } = songData.body;

          // Update the popularity and duration fields in the existing song document
          existingSong.popularity = popularity || 0;
          existingSong.duration = Math.round(duration_ms / 1000);
          await existingSong.save();
        } else {
          // Fetch song details from Spotify
          const songData = await spotifyApi.getTrack(trackId);
          const { id, name, artists, album, popularity, duration_ms } =
            songData.body;

          // Fetch genres from artists
          let genres: string[] = [];
          for (const artist of artists) {
            const artistData = await spotifyApi.getArtist(artist.id);
            genres = [...genres, ...artistData.body.genres];
          }

          // Remove duplicates from the genres array
          genres = [...new Set(genres)];

          let releaseYear = null;
          const releaseDate = album.release_date;

          // Validate release_date and extract releaseYear
          if (releaseDate) {
            const parsedDate = new Date(releaseDate);
            if (!isNaN(parsedDate.getTime())) {
              releaseYear = parsedDate.getFullYear();
            }
          }

          // Create a new song in the songs collection
          const newSong = new Song({
            songId: id,
            songName: name,
            artists: artists.map(
              (artist: SpotifyApi.ArtistObjectSimplified) => artist.name
            ),
            genre: genres,
            playlistId,
            albumId: album.id,
            releaseYear: releaseYear || 0,
            popularity: popularity || 0,
            duration: Math.round(duration_ms / 1000),
          });
          await newSong.save();
        }
      }
    }

    return NextResponse.json({ message: "Playlists synced successfully!" });
  } catch (error) {
    console.error("Error syncing playlists:", error);
    return NextResponse.json(
      { error: "Failed to sync playlists" },
      { status: 500 }
    );
  }
}
