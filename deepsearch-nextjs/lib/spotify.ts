import SpotifyWebApi from "spotify-web-api-node";

// Create a singleton Spotify API client
let spotifyApi: SpotifyWebApi | null = null;

export function getSpotifyApi(): SpotifyWebApi {
  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
  }
  return spotifyApi;
}

export { spotifyApi };
export default getSpotifyApi;
