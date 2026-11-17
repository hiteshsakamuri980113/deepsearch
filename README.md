# DeepSearch

DeepSearch lets you filter your own Spotify playlists by genre, release year, popularity and duration, and then turn the filtered songs into a new Spotify playlist. There is also a chat assistant that can search the web for music information and create playlists from a description.

## What it does

- Log in with Spotify (OAuth). The app asks for permission to read and modify your playlists.
- Sync your playlists into MongoDB. For each song it stores the name, artists, release year, duration and popularity, plus genres taken from the song's artists.
- Pick a playlist and build filters on genre, release year, popularity and duration. Filters can be joined with AND or OR, and applying them gives you the list of matching songs.
- Name the result and create it as a new playlist in your Spotify account.
- Chat with an assistant that runs on Gemini 2.0 Flash. It searches the web for music questions (charts, awards, new releases) and can create a Spotify playlist for you. The chat is hidden on the home page and available everywhere else.
- Profile page showing your Spotify account details.

## How it fits together

```
Browser ── Next.js app (Vercel) ──┬── Spotify Web API
                                  ├── MongoDB (playlists and song metadata)
                                  └── iframe ── Python agent (FastAPI, Render)
                                                  └── Gemini 2.0 Flash + Google Search
                                                      + Spotify tools
```

- `deepsearch-nextjs/` is the web app. Its API routes (`app/api/`) talk to Spotify and MongoDB.
- `agent/ad-streaming/` is the Python service for the chat. It serves a small chat page that the web app embeds in an iframe, and the page talks to the agent over a WebSocket (`/ws/{session_id}`). The web app sends the user's Spotify tokens to the agent at `/api/spotify-data` so the agent can create playlists on their behalf.

## Tech stack

**Web app:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Redux Toolkit, Mongoose, spotify-web-api-node

**Agent:** Python 3.11, FastAPI, Google ADK with Gemini 2.0 Flash, the `google_search` tool

**Data and hosting:** MongoDB, Vercel for the web app, Render for the agent (see [DEPLOYMENT.md](DEPLOYMENT.md))

## Running it locally

You need Node 18+, Python 3.11+, a MongoDB database, a Spotify developer app and a Google API key.

### 1. Spotify app

Create an app at [developer.spotify.com](https://developer.spotify.com) and add this redirect URI:

```
http://localhost:3000/api/spotify/callback
```

### 2. Web app

```bash
cd deepsearch-nextjs
npm install
```

Create `deepsearch-nextjs/.env.local`:

```env
MONGODB_URI=<your MongoDB connection string>
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=<Spotify client ID>
SPOTIFY_CLIENT_SECRET=<Spotify client secret>
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AGENT_URL=http://localhost:8000
JWT_SECRET=<any long random string>
```

```bash
npm run dev
```

The app runs on http://localhost:3000.

### 3. Agent

```bash
cd agent/ad-streaming
pip install -r requirements.txt
```

Create `agent/ad-streaming/.env`:

```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=<your Google API key>
SPOTIFY_CLIENT_ID=<Spotify client ID>
SPOTIFY_CLIENT_SECRET=<Spotify client secret>
```

```bash
python main.py
```

The agent runs on http://localhost:8000. Log in to the web app first. The web app sends your Spotify token to the agent, and the agent needs it before it can create playlists.

## API routes (web app)

| Route | Purpose |
|---|---|
| `GET /api/spotify/auth` | Start the Spotify login |
| `GET /api/spotify/callback` | Finish the login |
| `POST /api/spotify/logout` | Log out |
| `GET /api/user` | Spotify profile for the logged-in user |
| `GET /api/playlists/sync` | Sync Spotify playlists and their songs into MongoDB |
| `GET /api/playlists`, `/api/playlists/[playlistId]` | Playlists and one playlist's songs |
| `GET /api/songs/[songId]` | One song's stored metadata |
| `POST /api/playlists/create-playlist` | Create a Spotify playlist from the filtered songs |

## Known limitations

- The agent stores the Spotify tokens it receives in memory and tries to write them to a `.env` file. That works locally, but on a host with a read-only filesystem like Render only the in-memory copy is kept, so a restart loses it. [TOKEN_MANAGEMENT.md](TOKEN_MANAGEMENT.md) goes into this.
- Playlists in MongoDB are not scoped per user. This is fine for a single-user project, but it would need a user ID on the playlist records before it could be shared.
- Genres come from the song's artists, since Spotify doesn't give genres per track. Songs by artists with no genres listed won't match a genre filter.
- No automated tests yet.
