# DeepSearch web app

The Next.js part of DeepSearch. The main project README is [one level up](../README.md), including setup for the Python chat agent.

## Run it

```bash
npm install
```

Create `.env.local` (see the main README for what each value is):

```env
MONGODB_URI=
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_AGENT_URL=http://localhost:8000
JWT_SECRET=
```

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run dev-normal` | Dev server without Turbopack |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |

## Structure

- `app/page.tsx` is the home page with the Spotify login.
- `app/new-search/` is the filter page. It has the playlist picker, the filter builder and playlist creation.
- `app/playlists/` lists your synced playlists.
- `app/profile/` shows your Spotify profile.
- `app/api/` has the route handlers for Spotify auth, playlist sync, songs and playlist creation.
- `app/components/Agent.tsx` is the chat button. It opens the Python agent in an iframe.
- `app/state/` and `app/store/` hold the Redux Toolkit slices and store.
- `models/` has the Mongoose schemas for playlists and songs.
- `lib/` has the MongoDB connection, the Spotify client and environment config.
