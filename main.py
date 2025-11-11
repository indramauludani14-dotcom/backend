"""
Main entry point for Railway, Render, Heroku deployment
Compatible with both serverless (Vercel/Firebase) and traditional hosting
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import Flask app
from api.index import app

# For Railway/Render/Heroku - app variable is required
# For Firebase Functions - backend variable is used

# Export app
if __name__ == "__main__":
    # Get port from environment variable (Railway sets this)
    port = int(os.environ.get("PORT", 8080))
    
    print(f"🚀 Starting Flask app on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
