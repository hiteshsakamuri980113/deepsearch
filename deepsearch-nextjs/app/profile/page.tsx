"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserThunk } from "../state/userSlice";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";
import NavigationBar from "../components/NavigationBar";
import PrivateRoute from "../components/PrivateRoute";

const Profile: React.FC = () => {
  const dispatch = useDispatch();

  // Get user details and loading state from Redux store
  const { user, loading, error } = useSelector((state: any) => state.user);

  // Get access token from SpotifyAuthContext
  const { accessToken } = useSpotifyAuth();

  // Fetch user details when the component mounts or accessToken changes
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchUserThunk(accessToken) as any);
    }
  }, [accessToken, dispatch]);

  // Render loading or error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-[#a8f0e8]">
        Loading user details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-500">
        Error fetching user details: {error}
      </div>
    );
  }

  // Render user details
  return (
    <PrivateRoute>
      <NavigationBar />
      <div className="flex items-center justify-center min-h-screen bg-black text-[#a8f0e8]">
        <div className="rounded-lg shadow-lg p-8 w-full max-w-lg bg-[#1e1e1e]">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            {user?.images && user.images.length > 0 ? (
              <img
                src={user.images[0].url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.display_name
                  ? user.display_name.charAt(0).toUpperCase()
                  : "U"}
              </div>
            )}
          </div>

          {/* Profile Title */}
          <h2 className="text-3xl font-bold mb-4 text-center">
            {user?.display_name || "Your Spotify Profile"}
          </h2>

          {/* Divider */}
          <div className="border-t border-gray-600 mb-6"></div>

          {/* Profile Details */}
          <div className="space-y-4 text-lg">
            <div>
              <strong>Email:</strong> {user?.email || "N/A"}
            </div>
            <div>
              <strong>Country:</strong> {user?.country || "N/A"}
            </div>
            <div>
              <strong>Followers:</strong> {user?.followers?.total || 0}
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default Profile;
