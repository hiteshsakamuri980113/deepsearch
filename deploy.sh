#!/bin/bash

# DeepSearch Deployment Helper Script
# This script helps you deploy the application step by step

echo "🚀 DeepSearch Deployment Helper"
echo "==============================="
echo ""

echo "This script will guide you through deploying your DeepSearch application."
echo "Make sure you have the following ready:"
echo "1. Render account (https://render.com)"
echo "2. Vercel account (https://vercel.com)" 
echo "3. MongoDB Atlas account (https://mongodb.com/atlas)"
echo "4. Your code pushed to a Git repository"
echo ""

read -p "Do you have all prerequisites ready? (y/n): " ready

if [ "$ready" != "y" ]; then
    echo "Please complete the prerequisites first and run this script again."
    exit 1
fi

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo ""

echo "Step 1: Deploy Python Backend to Render"
echo "----------------------------------------"
echo "1. Go to https://dashboard.render.com/"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect your repository"
echo "4. Set Root Directory to: agent/ad-streaming"
echo "5. Build Command: pip install -r requirements.txt"
echo "6. Start Command: uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo ""
echo "Environment Variables to set in Render:"
echo "GOOGLE_GENAI_USE_VERTEXAI=FALSE"
echo "GOOGLE_API_KEY=your_google_api_key"
echo "SPOTIFY_CLIENT_ID=e9fadad13a1f4850816927b5d9d041f9"
echo "SPOTIFY_CLIENT_SECRET=578f20a0647e4dd7a8f7f85a1b1dc771"
echo "REFRESH_TOKEN=your_refresh_token"
echo "SPOTIFY_ACCESS_TOKEN=your_access_token"
echo ""

read -p "Press Enter when backend is deployed and copy your Render URL..."
read -p "Enter your Render backend URL (e.g., https://your-app.onrender.com): " backend_url

echo ""
echo "Step 2: Setup MongoDB Atlas"
echo "---------------------------"
echo "1. Go to https://cloud.mongodb.com/"
echo "2. Create a new cluster (free tier)"
echo "3. Create database user"
echo "4. Whitelist IP addresses (0.0.0.0/0 for all IPs)"
echo "5. Get connection string"
echo ""

read -p "Press Enter when MongoDB is ready and copy your connection string..."
read -p "Enter your MongoDB connection string: " mongodb_uri

echo ""
echo "Step 3: Deploy Frontend to Vercel"
echo "---------------------------------"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Import your repository"
echo "4. Set Root Directory to: deepsearch-nextjs"
echo "5. Framework should auto-detect as Next.js"
echo ""

read -p "Press Enter when frontend is deployed..."
read -p "Enter your Vercel app URL (e.g., https://your-app.vercel.app): " frontend_url

echo ""
echo "Step 4: Update Spotify App Settings"
echo "-----------------------------------"
echo "1. Go to https://developer.spotify.com/dashboard"
echo "2. Edit your app settings"
echo "3. Add redirect URI: $frontend_url/api/spotify/callback"
echo ""

read -p "Press Enter when Spotify settings are updated..."

echo ""
echo "Step 5: Set Vercel Environment Variables"
echo "----------------------------------------"
echo "Go to your Vercel project → Settings → Environment Variables"
echo "Add these variables:"
echo ""
echo "MONGODB_URI=$mongodb_uri"
echo "NEXT_PUBLIC_SPOTIFY_CLIENT_ID=e9fadad13a1f4850816927b5d9d041f9"
echo "SPOTIFY_CLIENT_SECRET=578f20a0647e4dd7a8f7f85a1b1dc771"
echo "NEXT_PUBLIC_API_URL=$backend_url"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SPOTIFY_REDIRECT_URI=$frontend_url/api/spotify/callback"
echo "NEXT_PUBLIC_APP_URL=$frontend_url"
echo "NODE_ENV=production"
echo ""

read -p "Press Enter when environment variables are set..."

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo ""
echo "Your app should now be live at: $frontend_url"
echo "Backend API is running at: $backend_url"
echo ""
echo "Next steps:"
echo "1. Test login functionality"
echo "2. Verify AI agent works"
echo "3. Test playlist sync and creation"
echo ""
echo "If you encounter issues, check the deployment guide: ./DEPLOYMENT.md"
echo ""
echo "🎉 Happy coding!"
