#!/bin/bash

# PM2 Fix and Restart Script
# Run this on your remote server: kianirad2020@selenium:~/ai-services-platform

echo "🔧 Fixing PM2 deployment issues..."

# Kill all PM2 processes to start fresh
echo "Stopping all PM2 processes..."
pm2 kill

# Clear PM2 process list
echo "Clearing PM2 process list..."
pm2 delete all 2>/dev/null || true

# Wait a moment
sleep 2

# Start fresh with the ecosystem config
echo "Starting fresh PM2 processes..."
pm2 start ecosystem.config.js --env production

# Check status
echo "Checking PM2 status..."
pm2 list

# Show logs to verify startup
echo "Showing recent logs..."
pm2 logs --lines 20

echo "✅ PM2 restart complete!"
echo ""
echo "If the server is running properly, you should see:"
echo "  - Process status: online"
echo "  - No error logs"
echo "  - Server listening on port 3000"
echo ""
echo "Test the server:"
echo "  curl http://localhost:3000/health"
echo "  curl http://34.169.105.176:3000/health"