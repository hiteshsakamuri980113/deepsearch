"use client";
import { useSpotifyAuth } from "./context/SpotifyAuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function LandingPage() {
  const { login, accessToken } = useSpotifyAuth();
  const router = useRouter();

  // Redirect to new-search if already authenticated
  useEffect(() => {
    if (accessToken) {
      router.push("/new-search");
    }
  }, [accessToken, router]);

  if (accessToken) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-teal-300">
        <div>Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Bar */}
      <div className="flex justify-between items-center p-6 bg-black text-teal-300">
        <h2 className="text-xl font-bold">Deep Search</h2>
        <div className="space-x-6">
          <a
            href="/community"
            className="text-xl font-bold hover:text-teal-300"
          >
            Community
          </a>
          <button
            onClick={login}
            className="text-xl font-bold hover:text-teal-300 cursor-pointer"
          >
            Login
          </button>
        </div>
      </div>

      <div className="flex min-h-screen bg-black text-teal-300 p-10">
        {/* Left Section */}
        <div className="w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl font-bold">Find Your Music, Your Way</h1>
          <p className="mt-4 text-lg">
            Deep Search lets you filter your Spotify playlists by genre,
            release year, popularity and duration, then save the results as a
            new playlist.
          </p>
          <ul className="mt-4 space-y-2">
            <li>Search deeper.</li>
            <li>Discover more.</li>
            <li>Play exactly what you want.</li>
          </ul>
          <p className="mt-6">Get started by logging in with Spotify!</p>
          <button
            onClick={login}
            className="mt-4 bg-gray-700 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-600 inline-block cursor-pointer"
          >
            Login with Spotify
          </button>
        </div>

        {/* Right Section - Only Logo */}
        <div className="w-1/2 flex items-center justify-center">
          <Image
            src="/Logo.png"
            alt="Deep Search Logo"
            width={400}
            height={400}
            className="w-1/2 h-auto object-contain"
          />
        </div>
      </div>
    </>
  );
}
