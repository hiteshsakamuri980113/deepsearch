# Deployment Guide

This guide will help you deploy the DeepSearch application to production using Render (for the Python backend) and Vercel (for the Next.js frontend).

## Prerequisites

1. [Render account](https://render.com) (free)
2. [Vercel account](https://vercel.com) (free)
3. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for database (free tier available)
4. Spotify Developer App credentials

## Part 1: Deploy Python Backend to Render

### 1.1 Prepare for Deployment

1. The backend code is already configured for Render deployment with:
   - `render.yaml` configuration file
   - `runtime.txt` specifying Python version
   - Health check endpoint at `/health`
   - CORS settings updated for production

### 1.2 Deploy to Render

1. **Create a new Web Service** on [Render Dashboard](https://dashboard.render.com/)
2. **Connect your repository** containing the `agent/ad-streaming` folder
3. **Configure the service:**
   - **Root Directory**: `agent/ad-streaming`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### 1.3 Set Environment Variables

In the Render dashboard, add these environment variables:

```
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=your_google_api_key_here
SPOTIFY_CLIENT_ID=e9fadad13a1f4850816927b5d9d041f9
SPOTIFY_CLIENT_SECRET=578f20a0647e4dd7a8f7f85a1b1dc771
REFRESH_TOKEN=your_spotify_refresh_token
SPOTIFY_ACCESS_TOKEN=your_spotify_access_token
```

### 1.4 Get Your Backend URL

After deployment, Render will provide you with a URL like:
`https://your-app-name.onrender.com`

**Important**: Copy this URL as you'll need it for the frontend deployment.

## Part 2: Setup MongoDB Atlas

### 2.1 Create Database

1. Create a free MongoDB Atlas account
2. Create a new cluster (free tier)
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for all IPs or specific IPs)
5. Get your connection string:
   `mongodb+srv://username:password@cluster.mongodb.net/deepsearch?retryWrites=true&w=majority`

## Part 3: Deploy Next.js Frontend to Vercel

### 3.1 Prepare for Deployment

1. Update your Spotify App settings:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Edit your app settings
   - Add redirect URI: `https://your-vercel-app.vercel.app/api/spotify/callback`

### 3.2 Deploy to Vercel

1. **Install Vercel CLI** (optional):

   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Set **Root Directory** to `deepsearch-nextjs`
   - Framework preset should auto-detect as "Next.js"

### 3.3 Set Environment Variables

In Vercel project settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deepsearch?retryWrites=true&w=majority
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=e9fadad13a1f4850816927b5d9d041f9
SPOTIFY_CLIENT_SECRET=578f20a0647e4dd7a8f7f85a1b1dc771
NEXT_PUBLIC_API_URL=https://your-render-app-name.onrender.com
JWT_SECRET=your_secure_random_jwt_secret
SPOTIFY_REDIRECT_URI=https://your-vercel-app.vercel.app/api/spotify/callback
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

**Replace the placeholder values with:**

- Your actual MongoDB connection string
- Your Render backend URL from Step 1.4
- Your Vercel app URL (available after first deployment)
- A secure random JWT secret

### 3.4 Update CORS Settings

After getting your Vercel URL, update the CORS settings in your Python backend:

1. In `agent/ad-streaming/main.py`, replace the placeholder domain:

   ```python
   allow_origins=[
       "http://localhost:3000",  # Local development
       "https://*.vercel.app",   # Vercel deployments
       "https://your-actual-vercel-app.vercel.app",  # Your specific domain
   ],
   ```

2. Redeploy your Render service to apply the changes.

## Part 4: Final Configuration

### 4.1 Test the Deployment

1. Visit your Vercel app URL
2. Try logging in with Spotify
3. Test the AI agent functionality
4. Verify playlist sync and creation features

### 4.2 Custom Domain (Optional)

You can add custom domains to both services:

- **Vercel**: Project Settings → Domains
- **Render**: Service Settings → Custom Domains

## Environment Variables Reference

### Backend (Render)

```
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=your_google_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REFRESH_TOKEN=your_refresh_token
SPOTIFY_ACCESS_TOKEN=your_access_token
```

### Frontend (Vercel)

```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com
JWT_SECRET=your_jwt_secret
SPOTIFY_REDIRECT_URI=https://your-vercel-app.vercel.app/api/spotify/callback
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Vercel URL is added to the CORS whitelist in the backend
2. **Database Connection**: Verify MongoDB connection string and IP whitelist
3. **Spotify Auth**: Ensure redirect URIs match exactly in Spotify app settings
4. **Environment Variables**: Double-check all required environment variables are set

### Logs:

- **Render**: Check logs in the Render dashboard
- **Vercel**: Check function logs in Vercel dashboard → Functions tab

## Security Notes

1. Never commit `.env` files with real credentials
2. Use environment variables for all sensitive data
3. Regularly rotate API keys and secrets
4. Keep dependencies updated

## Free Tier Limitations

- **Render Free**: Apps sleep after 15 minutes of inactivity
- **Vercel Free**: 100GB bandwidth, 1000 serverless function invocations per month
- **MongoDB Atlas Free**: 512MB storage, no backup

For production use, consider upgrading to paid plans for better performance and reliability.
