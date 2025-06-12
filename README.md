# DeepSearch 🎵

**AI-Powered Music Discovery and Playlist Management**

DeepSearch is a sophisticated music application that combines the power of Spotify's extensive music library with intelligent filtering and AI assistance to help you discover, organize, and create the perfect playlists.

## 🌟 Features

### Core Functionality

**🔍 Advanced Music Filtering**

- Filter your Spotify playlists by multiple criteria simultaneously
- Filter by **Genre**, **Release Year**, **Popularity Score**, and **Duration**
- Support for complex filter combinations with AND/OR logic
- Real-time filtering with instant results

**🎵 Smart Playlist Management**

- Automatic sync with your Spotify playlists
- View detailed song metadata including artists, duration, and release year
- Create new Spotify playlists directly from filtered results
- Browse and manage all your playlists in one place

**🤖 AI Music Assistant**

- Integrated AI agent powered by Google's Gemini 2.0 Flash
- Real-time web search for current music information
- Create playlists by describing what you want
- Get music recommendations and discover new artists
- Ask questions about songs, artists, charts, and music trends

### Technical Capabilities

**📊 Rich Music Metadata**

- Detailed song information including genre, popularity scores, and audio features
- Artist information and album details
- Release year tracking and filtering
- Duration-based searching and sorting

**🔄 Real-Time Synchronization**

- Seamless sync between the app and your Spotify account
- Automatic playlist updates when you make changes
- Live token management for uninterrupted access

**💾 Persistent Data Storage**

- MongoDB integration for reliable data persistence
- Efficient caching of playlist and song metadata
- Fast search and filtering operations

## 🛠️ Technology Stack

### Frontend (Next.js)

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI**: Custom responsive design with modern aesthetics

### Backend (Python)

- **Framework**: FastAPI with uvicorn
- **AI Integration**: Google Gemini 2.0 Flash via ADK
- **Real-time**: WebSocket support for AI chat
- **API Integration**: Spotify Web API

### Database & Services

- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Spotify OAuth 2.0
- **APIs**: Spotify Web API, Google Search API
- **Deployment**: Vercel (Frontend) + Render (Backend)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Spotify Developer Account
- MongoDB instance
- Google API Key (for AI features)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd deepsearch
   ```

2. **Setup Frontend**

   ```bash
   cd deepsearch-nextjs
   npm install
   cp .env.example .env.local
   # Configure your environment variables
   npm run dev
   ```

3. **Setup Backend**

   ```bash
   cd agent/ad-streaming
   pip install -r requirements.txt
   cp .env.example .env
   # Configure your environment variables
   python main.py
   ```

4. **Configure Spotify App**
   - Create a Spotify app at [developer.spotify.com](https://developer.spotify.com)
   - Set redirect URI to `http://localhost:3000/api/spotify/callback`
   - Add your client ID and secret to environment variables

## 📱 How to Use

### 1. Authentication

- Connect your Spotify account using the "Login with Spotify" button
- Grant necessary permissions for playlist access and management

### 2. Playlist Filtering

- Select any of your existing Spotify playlists
- Apply filters by genre, release year, popularity, or duration
- Combine multiple filters with AND/OR logic
- View filtered results in real-time

### 3. Create New Playlists

- After filtering songs, click "Create Spotify Playlist"
- Enter a name for your new playlist
- The playlist will be created in your Spotify account with the filtered songs

### 4. AI Assistant

- Click the "Chat with Agent" button (available on all pages except home)
- Ask for music recommendations, create playlists by description
- Get information about current music trends, charts, and artists
- The AI can search the web for up-to-date music information

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

**Backend (.env)**

```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=your_google_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

## 🌐 Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md) which includes:

- Render deployment for Python backend
- Vercel deployment for Next.js frontend
- MongoDB Atlas setup
- Environment configuration for production

## 🎯 Use Cases

- **Music Discovery**: Find songs in your library that match specific moods or criteria
- **Playlist Curation**: Create themed playlists using advanced filtering
- **Music Research**: Get current information about artists, songs, and trends
- **Smart Organization**: Better organize your extensive music library
- **AI-Powered Recommendations**: Discover new music through intelligent suggestions

## 🔒 Privacy & Security

- Uses official Spotify OAuth for secure authentication
- No storage of Spotify passwords or sensitive credentials
- Playlist data is synced and cached locally for performance
- AI interactions are processed securely through Google's API

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

---

**Built with ❤️ for music lovers who want more control over their listening experience.**
