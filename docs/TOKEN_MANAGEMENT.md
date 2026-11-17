# Token Management in Production Deployment

## The Problem You Identified 🚨

You're absolutely correct to be concerned! When you deploy to Render, the environment variables you set in the dashboard **will NOT** be updated by your frontend calls. Here's why:

### Why Environment Variables Can't Be Updated on Render

1. **Read-Only Environment**: Environment variables on cloud platforms like Render are part of the deployment configuration and are read-only at runtime.

2. **Container Limitations**: Your app runs in a container with a read-only file system for most directories.

3. **Process Separation**: Environment variables are loaded when the process starts and cannot be modified by the running application.

4. **No `.env` File**: The `update_env_file()` function in your code tries to write to a `.env` file, which won't exist or be writable on Render.

## What Happens Without a Fix

```python
# This function will FAIL on Render
def update_env_file(key: str, value: str, env_file_path: str = ".env"):
    # ❌ This file won't exist or be writable on Render
    with open(env_path, "w") as file:
        file.writelines(lines)
```

**Result**:

- Your AI agent will use stale tokens from the environment variables
- Users will get authentication errors after their tokens expire
- The frontend token updates will be ignored

## The Solution We Implemented ✅

### 1. In-Memory Token Storage

We added a global in-memory token storage system:

```python
# Global token storage (in-memory) for production deployment
current_tokens = {
    "access_token": None,
    "refresh_token": None,
    "updated_at": None
}

def update_tokens_in_memory(access_token: str = None, refresh_token: str = None):
    """Update tokens in memory instead of .env file"""
    global current_tokens

    if access_token:
        current_tokens["access_token"] = access_token
        print(f"Updated access token in memory")

    if refresh_token:
        current_tokens["refresh_token"] = refresh_token
        print(f"Updated refresh token in memory")

    current_tokens["updated_at"] = time.time()

def get_current_access_token():
    """Get the most recent access token"""
    global current_tokens

    # First try in-memory token (from frontend updates)
    if current_tokens["access_token"]:
        return current_tokens["access_token"]

    # Fallback to environment variable (initial deployment)
    return os.environ.get("SPOTIFY_ACCESS_TOKEN")
```

### 2. Updated API Endpoint

The `/api/spotify-data` endpoint now updates both systems:

```python
@app.post("/api/spotify-data")
async def receive_spotify_data(data: SpotifyData):
    try:
        # For production: use in-memory storage
        # For local dev: still update .env file
        is_production = os.environ.get("NODE_ENV") == "production" or os.environ.get("RENDER") == "true"

        if is_production:
            # ✅ This works on Render
            update_tokens_in_memory(
                access_token=data.access_token,
                refresh_token=data.refresh_token
            )
        else:
            # ✅ This works locally
            if data.access_token:
                update_env_file("SPOTIFY_ACCESS_TOKEN", data.access_token)

            if data.refresh_token:
                update_env_file("REFRESH_TOKEN", data.refresh_token)
```

### 3. Updated Agent Code

The AI agent now uses the improved token system:

```python
def get_latest_access_token():
    try:
        # ✅ Uses in-memory tokens when available
        return get_current_access_token()
    except (ImportError, NameError):
        # ✅ Fallback to old method for local development
        load_dotenv(override=True)
        return os.getenv("SPOTIFY_ACCESS_TOKEN")
```

## How It Works Now

### Development (Local)

1. Frontend sends tokens → Backend updates `.env` file ✅
2. AI agent reads from `.env` file ✅
3. Tokens persist between server restarts ✅

### Production (Render)

1. Frontend sends tokens → Backend stores in memory ✅
2. AI agent reads from memory first, then environment variables ✅
3. Tokens persist during server uptime ⚠️ (lost on restart)

## Limitations of This Solution

### ⚠️ Token Loss on Restart

- In-memory tokens are lost when the Render container restarts
- Users will need to re-authenticate after restarts
- Initial environment variables will be used until someone logs in

### ⚠️ Shared Tokens

- All users will share the same in-memory token storage
- The last user to log in will overwrite previous tokens
- This is only suitable for single-user or demo applications

## Better Production Solutions

For a production application with multiple users, consider:

### Option 1: Database Token Storage

```python
# Store tokens in MongoDB with user association
class UserToken(BaseModel):
    user_id: str
    access_token: str
    refresh_token: str
    expires_at: datetime
    updated_at: datetime
```

### Option 2: Redis Cache

```python
# Use Redis for fast token storage and retrieval
import redis
redis_client = redis.Redis.from_url(os.environ.get("REDIS_URL"))

def store_user_token(user_id: str, token: str):
    redis_client.setex(f"token:{user_id}", 3600, token)
```

### Option 3: Encrypted Environment Updates

```python
# Use Render's API to update environment variables (advanced)
# Requires API keys and careful implementation
```

## Testing the Fix

### Local Development

1. Start your backend: `python main.py`
2. Check that `.env` file updates still work
3. Verify AI agent can access updated tokens

### Production Testing

1. Deploy to Render
2. Log in through frontend
3. Check Render logs to see "Updated access token in memory"
4. Test AI agent functionality
5. Verify it works even with stale environment variables

## Summary

✅ **Your concern was valid** - environment variables cannot be updated on Render
✅ **We implemented a working solution** - in-memory token storage for production
⚠️ **Limitations exist** - tokens lost on restart, shared between users
🚀 **For production apps** - consider database or Redis-based token storage

The current solution will work for your deployment and handle the token update issue you identified!
