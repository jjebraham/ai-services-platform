#!/bin/bash

echo "🔧 Setting up SMS/OTP functionality on server..."

# Stop current server
pm2 stop kiani-exchange || true
pkill -f "node.*production-server" || true

# Backup current files
if [ -f "production-server.js" ]; then
    cp production-server.js production-server.js.backup.$(date +%Y%m%d_%H%M%S)
fi

if [ -f "simple-auth-service.js" ]; then
    cp simple-auth-service.js simple-auth-service.js.backup.$(date +%Y%m%d_%H%M%S)
fi

# Install/update dependencies
npm install

# Start server with PM2
pm2 start ecosystem.config.js --env production

# Check if server started successfully
sleep 3
if pm2 list | grep -q "kiani-exchange.*online"; then
    echo "✅ Server started successfully with SMS/OTP functionality"
    echo "🌐 Server is running on http://kiani.exchange:3000"
    echo "📱 SMS registration is now available"
else
    echo "❌ Server failed to start. Check PM2 logs:"
    pm2 logs kiani-exchange --lines 20
fi
