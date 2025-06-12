"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";

const NavigationBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { logout } = useSpotifyAuth();

  const handleNavigation = (path: string): void => {
    router.push(path);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    setIsDropdownOpen(false);
  };

  const isActivePath = (path: string): boolean => pathname === path;

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex justify-between items-center px-10 py-5 text-base font-normal z-[1000]"
      style={{ backgroundColor: "#1e1e1e", color: "#a8f0e8" }}
    >
      <div
        className="text-xl cursor-pointer transition-colors duration-300"
        style={{ color: "#a8f0e8" }}
        onClick={() => handleNavigation("/new-search")}
      >
        <span className="font-bold">Deep</span>{" "}
        <span className="font-normal">Search</span>
      </div>

      <div className="flex gap-8 relative">
        <span
          className="cursor-pointer transition-all duration-300"
          style={{
            color: isActivePath("/new-search") ? "#6ee7b7" : "#a8f0e8",
            textShadow: isActivePath("/new-search")
              ? "0 0 6px #6ee7b7, 0 0 12px #6ee7b7, 0 0 18px #34d399"
              : "none",
            transform: isActivePath("/new-search") ? "scale(1.05)" : "none",
          }}
          onClick={() => handleNavigation("/new-search")}
        >
          New Search
        </span>

        <span
          className="cursor-pointer transition-all duration-300"
          style={{
            color: isActivePath("/playlists") ? "#6ee7b7" : "#a8f0e8",
            textShadow: isActivePath("/playlists")
              ? "0 0 6px #6ee7b7, 0 0 12px #6ee7b7, 0 0 18px #34d399"
              : "none",
            transform: isActivePath("/playlists") ? "scale(1.05)" : "none",
          }}
          onClick={() => handleNavigation("/playlists")}
        >
          Your Playlists
        </span>

        <div
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <span
            className="cursor-pointer transition-all duration-300"
            style={{ color: "#a8f0e8" }}
            aria-expanded={isDropdownOpen}
            aria-label="Account menu"
          >
            Account
          </span>

          <div
            className="absolute rounded-lg overflow-hidden z-[1001] transition-all duration-300"
            style={{
              top: "100%",
              right: "-13px",
              backgroundColor: "#2a2a2a",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              opacity: isDropdownOpen ? 1 : 0,
              transform: isDropdownOpen ? "translateY(0)" : "translateY(-10px)",
              pointerEvents: isDropdownOpen ? "auto" : "none",
            }}
          >
            <div
              className="px-5 py-2 cursor-pointer transition-colors duration-300"
              style={{ color: "#a8f0e8" }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#3a3a3a";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "transparent";
              }}
              onClick={() => handleNavigation("/profile")}
            >
              Profile
            </div>
            <div
              className="px-5 py-2 cursor-pointer transition-colors duration-300"
              style={{ color: "#a8f0e8" }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#3a3a3a";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "transparent";
              }}
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
