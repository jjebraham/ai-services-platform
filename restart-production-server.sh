#!/bin/bash
# Restart production server with proper PM2 ready handling

echo "🔄 Restarting kiani-exchange production server..."

# Stop PM2 process gracefully
pm2 stop kiani-exchange || echo "Process not running"

# Wait for port to be released
sleep 2

# Check if port is still in use
if lsof -i:3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 still in use, forcing cleanup..."
    kill $(lsof -t -i:3000) 2>/dev/null || true
    sleep 1
fi

# Delete the process
pm2 delete kiani-exchange 2>/dev/null || true

# Start the server with production environment
pm2 start ecosystem.config.js --env production

# Show status
pm2 list

# Show logs for a few seconds
echo "📝 Showing initial logs..."
pm2 logs kiani-exchange --lines 20