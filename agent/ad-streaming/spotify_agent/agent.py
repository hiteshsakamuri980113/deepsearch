import os
import subprocess
import urllib.parse
from google.adk.agents import Agent
from google.adk.tools import google_search
import requests
import time
from dotenv import load_dotenv

# Import token functions from main module
try:
    from main import get_current_access_token
except ImportError:
    # Fallback for local development
    def get_current_access_token():
        load_dotenv(override=True)
        return os.getenv("SPOTIFY_ACCESS_TOKEN")

# Global variables for token management (legacy, for fallback)
_last_token_reload_time = 0
_token_reload_interval = 5  # Reload token every 5 seconds

def get_latest_access_token():
    """
    Gets the latest access token - now uses the improved token management
    Falls back to old method if new method is not available
    """
    try:
        # Try using the new token management from main.py
        return get_current_access_token()
    except (ImportError, NameError):
        # Fallback to old method for backward compatibility
        global _last_token_reload_time
        
        current_time = time.time()
        if current_time - _last_token_reload_time > _token_reload_interval:
            load_dotenv(override=True)  # Force reload of .env file
            _last_token_reload_time = current_time
            
        access_token = os.getenv("SPOTIFY_ACCESS_TOKEN")
        if not access_token:
            print("WARNING: SPOTIFY_ACCESS_TOKEN not found in environment")
        return access_token

def search_tracks(song_names, user_token=None) -> dict:
    # Use provided token or get latest
    token = user_token if user_token else get_latest_access_token()
    
    if not token:
        return {"status": "error", "message": "No valid access token available"}
        
    headers = {"Authorization": f"Bearer {token}"}
    track_uris = []
    found_songs = []
    not_found_songs = []

    for song_name in song_names:
        search_url = "https://api.spotify.com/v1/search"
        params = {"q": song_name.strip(), "type": "track", "limit": 1}  # Strip whitespace and limit to 1 result
        response = requests.get(search_url, headers=headers, params=params)

        if response.status_code != 200:
            not_found_songs.append(song_name)
            continue

        results = response.json()
        tracks = results.get("tracks", {}).get("items", [])
        if tracks:
            track = tracks[0]
            track_uris.append(track["uri"])
            found_songs.append(f"{track['name']} by {', '.join([artist['name'] for artist in track['artists']])}")
        else:
            not_found_songs.append(song_name)

    return {
        "status": "success", 
        "track_uris": track_uris,
        "found_songs": found_songs,
        "not_found_songs": not_found_songs
    }

def create_spotify_playlist(playlist_name: str, song_names: str) -> dict:
    """
    Creates a Spotify playlist with the given name and songs.
    
    Args:
        playlist_name: Name for the new playlist
        song_names: Songs in format "Song1, Song2, Song3" or "Song1\nSong2\nSong3" 
                   Should include artist names for better matching (e.g., "Bohemian Rhapsody by Queen")
    """
    user_token = get_latest_access_token()

    if not user_token:
        return {"status": "error", "message": "No valid access token available"}

    # Handle different input formats - split by comma or newline
    if ', ' in song_names:
        songList = [song.strip() for song in song_names.split(', ')]
    elif '\n' in song_names:
        songList = [song.strip() for song in song_names.split('\n') if song.strip()]
    else:
        # Single song or comma without space
        songList = [song.strip() for song in song_names.split(',')]
    
    # Remove empty strings
    songList = [song for song in songList if song]
    
    if not songList:
        return {"status": "error", "message": "No valid songs provided"}

    search_result = search_tracks(songList, user_token)
    if search_result["status"] != "success":
        return search_result

    track_uris = search_result["track_uris"]
    found_songs = search_result["found_songs"]
    not_found_songs = search_result["not_found_songs"]
    
    if not track_uris:
        return {"status": "error", "message": f"No songs could be found on Spotify. Not found: {', '.join(not_found_songs)}"}

    # Get the current user's profile
    user_profile_url = "https://api.spotify.com/v1/me"
    headers = {"Authorization": f"Bearer {user_token}"}
    response = requests.get(user_profile_url, headers=headers)

    if response.status_code != 200:
        return {"status": "error", "message": "Failed to fetch user profile."}

    user_id = response.json()["id"]

    # Create a new playlist
    create_playlist_url = f"https://api.spotify.com/v1/users/{user_id}/playlists"
    payload = {
        "name": playlist_name,
        "description": "A playlist created by DeepSearch AI Music Assistant.",
        "public": False,
    }
    response = requests.post(create_playlist_url, headers=headers, json=payload)

    if response.status_code != 201:
        return {"status": "error", "message": "Failed to create playlist."}

    playlist_id = response.json()["id"]

    # Add tracks to the playlist
    add_tracks_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    payload = {"uris": track_uris}
    response = requests.post(add_tracks_url, headers=headers, json=payload)

    if response.status_code != 201:
        return {"status": "error", "message": "Failed to add tracks to playlist."}
    
    # Open Spotify app
    subprocess.run(["open", "-a", "Spotify"])
    
    # Create detailed response
    success_message = f"Playlist '{playlist_name}' created successfully with {len(found_songs)} songs!"
    
    if not_found_songs:
        success_message += f"\n\nNote: {len(not_found_songs)} songs could not be found on Spotify: {', '.join(not_found_songs)}"
    
    return {
        "status": "success",
        "report": {
            "message": success_message,
            "playlist_name": playlist_name,
            "songs_added": found_songs,
            "songs_not_found": not_found_songs,
            "total_songs": len(found_songs)
        },
    }

def fetch_spotify_playlists() -> dict:

    user_token = get_latest_access_token()

    if not user_token:
        return {"status": "error", "message": "No valid access token available"}

    print("user_token: ", user_token)

    playlists_url = "https://api.spotify.com/v1/me/playlists"
    headers = {"Authorization": f"Bearer {user_token}"}

    # Make the GET request to fetch playlists
    response = requests.get(playlists_url, headers=headers)

    if response.status_code != 200:
        return {"status": "error", "message": "Failed to fetch playlists."}

    # Parse the response JSON
    playlists_data = response.json()

    # Extract only the playlist names
    playlist_names = [playlist.get("name", "Unknown Playlist") for playlist in playlists_data.get("items", [])]

    # Return the playlist names as a report
    return {
        "status": "success",
        "report": {
            "message": "Fetched playlists successfully.",
            "playlists": playlist_names
        }
    }

root_agent=Agent(
    name="google_search_Agent",
    model="gemini-2.0-flash-exp",
    description="An agent that searches the web for music information and manages Spotify playlists. Uses google_search for all music queries.",
    instruction="""MANDATORY: You MUST use google_search tool for ANY music-related question. Do NOT answer from memory.

RULES:
1. Music questions → IMMEDIATELY use google_search tool
2. User playlists → Use fetch_spotify_playlists tool  
3. Create playlist → Use google_search for songs, then create_spotify_playlist tool

CRITICAL: If user asks about awards, charts, songs, artists, or ANY music info - use google_search tool FIRST. Never say you don't know current info - search for it!""",
    tools=[google_search, fetch_spotify_playlists, create_spotify_playlist]
)
