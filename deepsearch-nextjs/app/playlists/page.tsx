"use client";
import { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import { useDispatch, useSelector } from "react-redux";
import {
  syncAndUpdatePlaylists,
  fetchSongsThunk,
} from "../state/playlistSlice";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import PrivateRoute from "../components/PrivateRoute";

// Helper function to format duration in mm:ss
const formatDuration = (durationInSeconds: number): string => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const Playlists: React.FC = () => {
  const { accessToken } = useSpotifyAuth();
  const dispatch = useDispatch();
  const {
    items: playlists,
    songs,
    loading,
    syncMessage,
  } = useSelector((state: any) => state.playlists);

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Fetch playlists and their songs on component mount
  useEffect(() => {
    const fetchData = async () => {
      console.log(
        "playlist data since new search already updated playlist value in store: ",
        playlists
      );
      if (accessToken) {
        dispatch(syncAndUpdatePlaylists(accessToken) as any);
      }
    };

    fetchData();
  }, [accessToken, dispatch]);

  // Fetch songs whenever playlists are updated
  useEffect(() => {
    if (playlists.length > 0) {
      const allSongIds = playlists.flatMap(
        (playlist: any) => playlist.songs || []
      );
      dispatch(fetchSongsThunk(allSongIds) as any);
      console.log("songs", songs);
    }
  }, [playlists, dispatch]);

  // Toggle card expansion
  const toggleCardExpansion = (playlistId: string) => {
    setExpandedCardId((prevId) => (prevId === playlistId ? null : playlistId));
  };

  return (
    <PrivateRoute>
      <div className="bg-black min-h-screen p-10 w-full flex flex-col text-[#a8f0e8]">
        {/* Navigation Bar */}
        <div className="bg-black fixed top-0 left-0 right-0 z-50 w-full">
          <NavigationBar />
        </div>

        {/* Main Content */}
        <div className="mt-24 flex flex-col items-center">
          <h2 className="text-3xl font-semibold mb-6">Your Playlists</h2>

          {/* Loading State */}
          {loading ? (
            <p className="text-lg text-gray-400">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-lg text-gray-400">No playlists found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {playlists.map((playlist: any) => {
                const isExpanded = expandedCardId === playlist.id;
                return (
                  <div
                    key={playlist.id}
                    className="p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 relative bg-[#1e1e1e]"
                  >
                    {/* Playlist Name */}
                    <h3 className="text-xl font-semibold mb-4 text-[#a8f0e8]">
                      {playlist.name || "Untitled Playlist"}
                    </h3>

                    {/* Songs List */}
                    <div className="relative">
                      <ul
                        className={`space-y-4 ${
                          isExpanded ? "max-h-none" : "max-h-58"
                        } overflow-y-auto scrollbar-thin scrollbar-track-gray-600`}
                      >
                        {playlist.songs && playlist.songs.length > 0 ? (
                          playlist.songs.map((songId: string) => {
                            const song = songs[songId];
                            return song ? (
                              <li
                                key={`${playlist.id}-${songId}`}
                                className="p-4 rounded-lg shadow-md transition-colors duration-300 bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                              >
                                <p className="text-lg font-medium text-white">
                                  {song.songName || "Unknown Song"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Artists:{" "}
                                  {song.artists?.join(", ") || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Duration: {formatDuration(song.duration || 0)}
                                </p>
                              </li>
                            ) : (
                              <li
                                key={`${playlist.id}-${songId}-loading`}
                                className="p-4 rounded-lg shadow-md text-gray-400 bg-[#2a2a2a]"
                              >
                                Loading song details...
                              </li>
                            );
                          })
                        ) : (
                          <li className="text-gray-400 text-sm">
                            No songs available
                          </li>
                        )}
                      </ul>

                      {/* Scroll Indicator */}
                      {!isExpanded &&
                        playlist.songs &&
                        playlist.songs.length > 3 && (
                          <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none bg-gradient-to-t from-[#1e1e1e] to-transparent"></div>
                        )}
                    </div>

                    {/* Toggle Button */}
                    {playlist.songs && playlist.songs.length > 3 && (
                      <button
                        onClick={() => toggleCardExpansion(playlist.id)}
                        className="mt-2 text-sm flex items-center justify-center w-full text-gray-500 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>Show Less</span>{" "}
                            <span className="ml-2">↑</span>
                          </>
                        ) : (
                          <>
                            <span>Show More</span>{" "}
                            <span className="ml-2">↓</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default Playlists;
