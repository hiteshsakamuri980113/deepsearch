// Environment configuration helper
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

export const config = {
  // API URLs
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    (isDevelopment ? "http://localhost:8000" : ""),
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    (isDevelopment ? "http://localhost:3000" : ""),

  // Spotify configuration
  spotifyClientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "",
  spotifyRedirectUri:
    process.env.SPOTIFY_REDIRECT_URI ||
    (isDevelopment ? "http://localhost:3000/api/spotify/callback" : ""),

  // Environment flags
  isDevelopment,
  isProduction,

  // Validation
  isConfigured: () => {
    const required = [
      process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET,
      process.env.MONGODB_URI,
    ];

    if (isProduction) {
      required.push(
        process.env.NEXT_PUBLIC_API_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.SPOTIFY_REDIRECT_URI,
        process.env.JWT_SECRET
      );
    }

    return required.every(Boolean);
  },

  // Get missing configuration
  getMissingConfig: () => {
    const missing = [];

    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID)
      missing.push("NEXT_PUBLIC_SPOTIFY_CLIENT_ID");
    if (!process.env.SPOTIFY_CLIENT_SECRET)
      missing.push("SPOTIFY_CLIENT_SECRET");
    if (!process.env.MONGODB_URI) missing.push("MONGODB_URI");

    if (isProduction) {
      if (!process.env.NEXT_PUBLIC_API_URL) missing.push("NEXT_PUBLIC_API_URL");
      if (!process.env.NEXT_PUBLIC_APP_URL) missing.push("NEXT_PUBLIC_APP_URL");
      if (!process.env.SPOTIFY_REDIRECT_URI)
        missing.push("SPOTIFY_REDIRECT_URI");
      if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
    }

    return missing;
  },
};

export default config;
