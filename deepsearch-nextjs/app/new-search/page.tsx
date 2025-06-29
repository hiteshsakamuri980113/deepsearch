"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavigationBar from "../components/NavigationBar";
import PrivateRoute from "../components/PrivateRoute";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import {
  syncAndUpdatePlaylists,
  setSelectedPlaylist,
} from "../state/playlistSlice";
import type { RootState, AppDispatch } from "../store/globalStore";

interface Song {
  id: string;
  genre: string[];
  releaseYear: number;
  popularity: number;
  duration: number;
  artists: string[];
  name: string;
}

interface Filter {
  field: string;
  condition: string;
  value: string;
  connector: string;
  customValue?: string;
}

export default function NewSearch() {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken } = useSpotifyAuth();

  // Subscribe to playlist state from Redux store
  const {
    items: playlists,
    selectedPlaylist,
    syncMessage,
  } = useSelector((state: RootState) => state.playlists);

  // State variables
  const [songs, setSongs] = useState<Song[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[][]>([
    [{ field: "Genre", condition: "", value: "", connector: "" }],
  ]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [bannerType, setBannerType] = useState<string>("");
  const popupRef = useRef<HTMLDivElement>(null);

  // Initial data fetch
  useEffect(() => {
    if (accessToken) {
      dispatch(syncAndUpdatePlaylists(accessToken));
    }
  }, [accessToken, dispatch]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showPopup]);

  // Auto-dismiss success banner after 5 seconds
  useEffect(() => {
    if (bannerMessage && bannerType === "success") {
      const timer = setTimeout(() => {
        setBannerMessage(null);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [bannerMessage, bannerType]);

  // Handle playlist selection
  const handlePlaylistSelect = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`);
      const data = await response.json();
      dispatch(setSelectedPlaylist(data));

      // Fetch song metadata for the songs in the playlist
      const songMetadata = await Promise.all(
        data.songs.map(async (songId: string) => {
          const songResponse = await fetch(`/api/songs/${songId}`);
          const songData = await songResponse.json();
          return {
            id: songId,
            genre: songData.genre,
            releaseYear: songData.releaseYear,
            popularity: songData.popularity,
            duration: songData.duration,
            artists: songData.artists,
            name: songData.songName,
          };
        })
      );

      setSongs(songMetadata);

      // Extract unique values for each metadata field
      setGenres([...new Set(songMetadata.flatMap((song: Song) => song.genre))]);
    } catch (error) {
      console.error("Error fetching playlist details:", error);
    }
  };

  // Apply filters to find matching songs
  const applyFilters = () => {
    const matchingSongs = songs.filter((song) => {
      return filters.every((group) => {
        return group.reduce((groupResult: boolean | null, filter, index) => {
          const filterResult = matchFilter(song, filter);

          if (index === 0) {
            return filterResult;
          }

          if (filter.connector === "AND") {
            return (groupResult ?? false) && filterResult;
          } else if (filter.connector === "OR") {
            return (groupResult ?? false) || filterResult;
          }

          return groupResult ?? false;
        }, null as boolean | null);
      });
    });

    console.log("Matching Songs:", matchingSongs);
    setFilteredSongs(matchingSongs);
  };

  // Helper function to match a song against a single filter
  const matchFilter = (song: Song, filter: Filter): boolean => {
    if (filter.field === "Genre") {
      return filter.value
        ? Array.isArray(song.genre)
          ? song.genre.includes(filter.value)
          : song.genre === filter.value
        : false;
    }
    if (filter.field === "Release Year") {
      if (filter.condition === "After") {
        return song.releaseYear >= parseInt(filter.value);
      }
      if (filter.condition === "Before") {
        return song.releaseYear < parseInt(filter.value);
      }
      if (filter.condition === "In Between") {
        const [start, end] = filter.value.split("-").map(Number);
        return song.releaseYear >= start && song.releaseYear < end;
      }
    }
    if (filter.field === "Popularity") {
      if (filter.condition === "Predefined") {
        const maxPopularity = parseInt(filter.value.replace("<", ""), 10);
        return song.popularity < maxPopularity;
      }

      if (filter.condition === "Custom") {
        const customValue = parseInt(filter.customValue || "0", 10);
        return !isNaN(customValue) && song.popularity < customValue;
      }

      return false;
    }
    if (filter.field === "Duration") {
      const durationInSeconds = parseInt(filter.value) * 60;

      if (isNaN(durationInSeconds)) {
        return false;
      }

      if (filter.condition === "Less than") {
        return song.duration < durationInSeconds;
      }
      if (filter.condition === "More than") {
        return song.duration > durationInSeconds;
      }
      if (filter.condition === "In Between") {
        const [start, end] = filter.value
          .split("-")
          .map((v) => parseInt(v) * 60);

        if (isNaN(start) || isNaN(end)) {
          return false;
        }

        return song.duration >= start && song.duration <= end;
      }
    }
    return false;
  };

  // Add a new filter to a group
  const addFilter = (groupIndex: number, connector: string) => {
    const newFilters = [...filters];

    newFilters[groupIndex].push({
      field: "Genre",
      condition: "",
      value: "",
      connector: connector || "",
    });

    if (newFilters[groupIndex].length === 1) {
      newFilters[groupIndex][0].connector = "";
    }

    setFilters(newFilters);
  };

  // Remove a filter from a group
  const removeFilter = (groupIndex: number, filterIndex: number) => {
    const newFilters = [...filters];
    newFilters[groupIndex].splice(filterIndex, 1);

    if (newFilters[groupIndex].length === 0) {
      newFilters[groupIndex].push({
        field: "Genre",
        condition: "",
        value: "",
        connector: "",
      });

      setFilteredSongs([]);
    } else {
      newFilters[groupIndex][newFilters[groupIndex].length - 1].connector = "";
    }

    setFilters(newFilters);
  };

  // Format duration helper
  const formatDuration = (durationInSeconds: number): string => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Function to create a Spotify playlist
  const createSpotifyPlaylist = async () => {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (!accessToken) {
      setBannerMessage("Please log in first!");
      setBannerType("error");
      return;
    }
    if (!playlistName) {
      setBannerMessage("Please enter a playlist name!");
      setBannerType("error");
      return;
    }
    if (filteredSongs.length === 0) {
      setBannerMessage(
        "No songs to add to the playlist. Please apply filters first."
      );
      setBannerType("error");
      return;
    }

    try {
      const response = await fetch(
        `/api/playlists/create-playlist?access_token=${accessToken}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playlistName,
            songIds: filteredSongs.map((song) => song.id),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create playlist: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Playlist created:", data);

      setBannerMessage("Playlist created successfully!");
      setBannerType("success");

      setShowPopup(false);
      if (accessToken) {
        dispatch(syncAndUpdatePlaylists(accessToken));
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      setBannerMessage("Failed to create playlist. Please try again.");
      setBannerType("error");
    }
  };

  return (
    <PrivateRoute>
      <div className="bg-black min-h-screen text-[#a8f0e8] p-10 w-full flex flex-col">
        {/* Navigation Bar */}
        <div className="bg-black fixed top-0 left-0 right-0 z-50 w-full">
          <NavigationBar />
        </div>

        {/* Banner */}
        {bannerMessage && (
          <div
            className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center justify-between ${
              bannerType === "success"
                ? "bg-[#6ee7b7] text-black"
                : "bg-red-500 text-white"
            }`}
            style={{ maxWidth: "90%", width: "600px" }}
          >
            <span className="font-semibold">{bannerMessage}</span>
            <button
              onClick={() => setBannerMessage(null)}
              className="ml-4 text-black hover:text-gray-700 cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Main Content with Blur Effect */}
        <div className={`mt-24 w-full flex ${showPopup ? "blur-sm" : ""}`}>
          {/* Left Section: Playlist List */}
          <div className="w-1/3 bg-[#1e1e1e] p-5 rounded-lg space-y-2">
            <h2 className="text-xl font-semibold mb-4">Playlists</h2>
            <ul className="space-y-2">
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <li
                    key={playlist.playlistId}
                    className={`p-2 rounded-lg flex items-center justify-between hover:bg-[#3a3a3a] cursor-pointer shadow-md ${
                      selectedPlaylist?.playlistId === playlist.playlistId
                        ? "bg-[#3a3a3a] border border-[#a8f0e8]"
                        : "bg-[#2a2a2a]"
                    }`}
                    onClick={() => handlePlaylistSelect(playlist.playlistId)}
                  >
                    <p className="text-white font-medium text-sm">
                      {playlist.name}
                    </p>
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        selectedPlaylist?.playlistId === playlist.playlistId
                          ? "bg-[#a8f0e8] border-[#a8f0e8]"
                          : "bg-transparent border-gray-500"
                      }`}
                    ></div>
                  </li>
                ))
              ) : (
                <p className="text-gray-400">{syncMessage}</p>
              )}
            </ul>
          </div>

          {/* Right Section */}
          <div className="w-3/4 flex flex-col space-y-4 ml-6">
            {/* Filter Section */}
            <div className="bg-[#1e1e1e] p-5 rounded-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Filter
              </h2>

              {/* Display selected playlist details */}
              {selectedPlaylist && (
                <div className="mb-6 bg-[#2a2a2a] p-4 rounded-lg shadow-md flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    Playlist:{" "}
                    <span className="text-[#a8f0e8]">
                      {selectedPlaylist.name}
                    </span>
                  </h3>
                  <p className="text-lg font-medium text-white">
                    Total Songs:{" "}
                    <span className="text-[#a8f0e8]">
                      {selectedPlaylist.songs.length}
                    </span>
                  </p>
                </div>
              )}

              {/* Filter Groups */}
              {filters.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="bg-[#2a2a2a] p-4 rounded-lg space-y-4 w-full"
                >
                  {group.map((filter, filterIndex) => (
                    <div
                      key={filterIndex}
                      className="flex items-center gap-4 w-full"
                    >
                      {/* Dropdown for Field Selection */}
                      <select
                        className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                        value={filter.field}
                        onChange={(e) => {
                          const newFilters = [...filters];
                          newFilters[groupIndex][filterIndex].field =
                            e.target.value;
                          newFilters[groupIndex][filterIndex].condition = "";
                          newFilters[groupIndex][filterIndex].value = "";
                          setFilters(newFilters);
                        }}
                      >
                        <option value="Genre">Genre</option>
                        <option value="Release Year">Release Year</option>
                        <option value="Popularity">Popularity</option>
                        <option value="Duration">Duration</option>
                      </select>

                      {/* Input for Value */}
                      {filter.field === "Genre" ? (
                        <select
                          className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                          value={filter.value}
                          onChange={(e) => {
                            const newFilters = [...filters];
                            newFilters[groupIndex][filterIndex].value =
                              e.target.value;
                            setFilters(newFilters);
                          }}
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          {genres.map((genre, index) => (
                            <option key={`${genre}-${index}`} value={genre}>
                              {genre}
                            </option>
                          ))}
                        </select>
                      ) : filter.field === "Popularity" ? (
                        <>
                          <select
                            className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                            value={filter.value}
                            onChange={(e) => {
                              const newFilters = [...filters];
                              const selectedValue = e.target.value;

                              if (selectedValue === "custom") {
                                newFilters[groupIndex][filterIndex].value =
                                  "custom";
                                newFilters[groupIndex][filterIndex].condition =
                                  "Custom";
                              } else {
                                newFilters[groupIndex][filterIndex].value =
                                  selectedValue;
                                newFilters[groupIndex][filterIndex].condition =
                                  "Predefined";
                              }

                              setFilters(newFilters);
                            }}
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            <option value="<50">{"< 50"}</option>
                            <option value="<100">{"< 100"}</option>
                            <option value="<200">{"< 200"}</option>
                            <option value="custom">Custom</option>
                          </select>

                          {filter.value === "custom" && (
                            <div className="flex items-center gap-2">
                              <span className="text-white whitespace-nowrap flex-shrink-0">
                                Less than
                              </span>
                              <input
                                type="number"
                                className="bg-black p-2 rounded text-white w-48 cursor-pointer"
                                placeholder="Enter popularity"
                                value={filter.customValue || ""}
                                onChange={(e) => {
                                  const newFilters = [...filters];
                                  newFilters[groupIndex][
                                    filterIndex
                                  ].customValue = e.target.value;
                                  setFilters(newFilters);
                                }}
                              />
                            </div>
                          )}
                        </>
                      ) : filter.field === "Release Year" ? (
                        <>
                          <select
                            className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                            value={filter.condition}
                            onChange={(e) => {
                              const newFilters = [...filters];
                              newFilters[groupIndex][filterIndex].condition =
                                e.target.value;
                              newFilters[groupIndex][filterIndex].value = "";
                              setFilters(newFilters);
                            }}
                          >
                            <option value="">Select Condition</option>
                            <option value="After">After</option>
                            <option value="Before">Before</option>
                            <option value="In Between">In Between</option>
                          </select>
                          {filter.condition === "After" ||
                          filter.condition === "Before" ? (
                            <input
                              type="text"
                              className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                              placeholder="Year"
                              value={filter.value}
                              onChange={(e) => {
                                const newFilters = [...filters];
                                newFilters[groupIndex][filterIndex].value =
                                  e.target.value;
                                setFilters(newFilters);
                              }}
                            />
                          ) : filter.condition === "In Between" ? (
                            <>
                              <input
                                type="text"
                                className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                                placeholder="Start Year"
                                value={filter.value.split("-")[0] || ""}
                                onChange={(e) => {
                                  const newFilters = [...filters];
                                  const [, end] = filter.value.split("-");
                                  newFilters[groupIndex][
                                    filterIndex
                                  ].value = `${e.target.value}-${end || ""}`;
                                  setFilters(newFilters);
                                }}
                              />
                              <span className="text-white">to</span>
                              <input
                                type="text"
                                className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                                placeholder="End Year"
                                value={filter.value.split("-")[1] || ""}
                                onChange={(e) => {
                                  const newFilters = [...filters];
                                  const [start] = filter.value.split("-");
                                  newFilters[groupIndex][
                                    filterIndex
                                  ].value = `${start || ""}-${e.target.value}`;
                                  setFilters(newFilters);
                                }}
                              />
                            </>
                          ) : null}
                        </>
                      ) : filter.field === "Duration" ? (
                        <>
                          <select
                            className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                            value={filter.condition}
                            onChange={(e) => {
                              const newFilters = [...filters];
                              newFilters[groupIndex][filterIndex].condition =
                                e.target.value;
                              newFilters[groupIndex][filterIndex].value = "";
                              setFilters(newFilters);
                            }}
                          >
                            <option value="">Select Condition</option>
                            <option value="More than">More than</option>
                            <option value="Less than">Less than</option>
                            <option value="In Between">In Between</option>
                          </select>
                          {filter.condition === "More than" ||
                          filter.condition === "Less than" ? (
                            <input
                              type="text"
                              className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                              placeholder="Enter in mins"
                              value={filter.value}
                              onChange={(e) => {
                                const newFilters = [...filters];
                                newFilters[groupIndex][filterIndex].value =
                                  e.target.value;
                                setFilters(newFilters);
                              }}
                            />
                          ) : filter.condition === "In Between" ? (
                            <>
                              <input
                                type="text"
                                className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                                placeholder="Start (mins)"
                                value={filter.value.split("-")[0] || ""}
                                onChange={(e) => {
                                  const newFilters = [...filters];
                                  const [, end] = filter.value.split("-");
                                  newFilters[groupIndex][
                                    filterIndex
                                  ].value = `${e.target.value}-${end || ""}`;
                                  setFilters(newFilters);
                                }}
                              />
                              <span className="text-white">to</span>
                              <input
                                type="text"
                                className="flex-grow bg-black p-2 rounded text-white cursor-pointer"
                                placeholder="End (mins)"
                                value={filter.value.split("-")[1] || ""}
                                onChange={(e) => {
                                  const newFilters = [...filters];
                                  const [start] = filter.value.split("-");
                                  newFilters[groupIndex][
                                    filterIndex
                                  ].value = `${start || ""}-${e.target.value}`;
                                  setFilters(newFilters);
                                }}
                              />
                            </>
                          ) : null}
                        </>
                      ) : null}

                      {/* Add/Condition Button */}
                      <div className="flex items-center gap-2">
                        {filterIndex === group.length - 1 ? (
                          <select
                            className="w-20 bg-[#a8f0e8] text-black p-2 rounded cursor-pointer"
                            onChange={(e) =>
                              e.target.value &&
                              addFilter(groupIndex, e.target.value)
                            }
                          >
                            <option value="">Add</option>
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        ) : (
                          <select
                            className="w-20 bg-[#a8f0e8] text-black p-2 rounded cursor-pointer"
                            value={filter.connector}
                            onChange={(e) => {
                              const newFilters = [...filters];
                              newFilters[groupIndex][filterIndex].connector =
                                e.target.value;
                              setFilters(newFilters);
                            }}
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        )}
                      </div>

                      {/* Delete Button */}
                      <div className="flex items-center">
                        <button
                          className="text-red-600 hover:text-red-400 cursor-pointer"
                          onClick={() => removeFilter(groupIndex, filterIndex)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Apply Filters Button */}
              <div className="flex justify-center mt-4 w-full">
                <button
                  onClick={applyFilters}
                  className="bg-gradient-to-r from-[#a8f0e8] to-[#6ee7b7] text-black px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-[#6ee7b7] hover:to-[#a8f0e8] transition-all duration-300 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Filtered Songs Section */}
            {filteredSongs.length > 0 && (
              <div className="bg-[#1e1e1e] p-5 rounded-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Filtered Songs
                </h2>
                <div className="bg-[#2a2a2a] rounded-lg">
                  <div className="grid grid-cols-14 gap-4 p-3 bg-[#1e1e1e] text-white font-semibold">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Song Name</div>
                    <div className="col-span-3">Artists</div>
                    <div className="col-span-2 text-center">Release Year</div>
                    <div className="col-span-2 text-right">Duration</div>
                  </div>
                  <ul className="divide-y divide-gray-700">
                    {filteredSongs.map((song, index) => (
                      <li
                        key={song.id}
                        className="grid grid-cols-14 gap-4 p-3 items-center hover:bg-[#3a3a3a] text-white"
                      >
                        <div className="col-span-1 text-center text-gray-400">
                          {index + 1}
                        </div>
                        <div className="col-span-5 font-medium">
                          {song.name || "Unknown Song"}
                        </div>
                        <div className="col-span-3 text-gray-400">
                          {song.artists
                            ? song.artists.join(", ")
                            : "Unknown Artist(s)"}
                        </div>
                        <div className="col-span-2 text-center text-gray-400">
                          {song.releaseYear || "N/A"}
                        </div>
                        <div className="col-span-2 text-right text-gray-400">
                          {formatDuration(song.duration)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowPopup(true)}
                    className="bg-gradient-to-r from-[#a8f0e8] to-[#6ee7b7] text-black px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-[#6ee7b7] hover:to-[#a8f0e8] transition-all duration-300 cursor-pointer"
                  >
                    Create Spotify Playlist
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Popup for Playlist Name */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              ref={popupRef}
              className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg w-96"
            >
              <h3 className="text-xl font-semibold mb-4 text-center">
                Enter Playlist Name
              </h3>
              <input
                type="text"
                className="w-full bg-black p-2 rounded text-white mb-4 cursor-pointer"
                placeholder="Playlist Name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
              <div className="flex justify-center">
                <button
                  onClick={createSpotifyPlaylist}
                  className="bg-gradient-to-r from-[#a8f0e8] to-[#6ee7b7] text-black px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-[#6ee7b7] hover:to-[#a8f0e8] transition-all duration-300 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
}
