# How the agent gets Spotify tokens

The chat agent (`agent/ad-streaming`) creates playlists with the logged-in user's Spotify access token. This note covers how the token reaches the agent and what that means when it is deployed.

## The flow

1. The user logs in through the Next.js app, which gets an access token and a refresh token from Spotify.
2. The web app posts them to the agent at `POST /api/spotify-data`.
3. The agent keeps them in two places:
   - an in-memory dictionary (`current_tokens` in `main.py`)
   - the local `.env` file, through `update_env_file()`
4. When a tool in `spotify_agent/agent.py` needs a token, it calls `get_current_access_token()`. That returns the in-memory token if there is one, and otherwise falls back to the `SPOTIFY_ACCESS_TOKEN` environment variable. The refresh token works the same way with `REFRESH_TOKEN`.

## Why this matters on Render

Environment variables set in the Render dashboard can't be changed by the running app, so the agent can't update them. Any change to the `.env` file only lasts until the service restarts or redeploys. So in production the in-memory copy is the only thing that stays current, and it is lost on every restart. After a restart the agent falls back to whatever tokens are set in the dashboard, and those expire.

In practice, after a restart or a long idle period (Render's free tier sleeps), the user has to log in again before the agent can create playlists.

## Limitations

- **One shared token.** The agent holds a single token, so the last user to log in replaces everyone else's. That is fine for a personal project or a demo, but it is not safe for multiple users.
- **Tokens are lost on restart.** See above.
- **No refresh.** The agent stores a refresh token but doesn't use it to get a new access token, so an expired access token means logging in again.

## What I would change for real multi-user use

- Store tokens per user in MongoDB, with an expiry time, instead of one global value.
- Have the agent request a fresh access token from Spotify with the refresh token when the current one has expired.
- Keep the token out of the agent entirely: the web app could make the Spotify calls and the agent would only suggest the songs.
