#!/bin/bash

# SSL/TLS Fix Deployment Script
# Run this on your server to apply SSL fixes

echo "🔧 Applying SSL/TLS fixes for SMS service..."

# Navigate to project directory
cd /home/kianirad2020/ai-services-platform

# Backup current configuration
echo "📋 Backing up current configuration..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Update .env for SSL/TLS compatibility
echo "⚙️  Updating SSL/TLS configuration..."

# Disable proxy (common cause of SSL issues)
sed -i 's/USE_PROXY=1/USE_PROXY=0/' .env || echo "USE_PROXY not found, adding..."
grep -q "USE_PROXY" .env || echo "USE_PROXY=0" >> .env

# Add SSL compatibility settings
grep -q "NODE_TLS_REJECT_UNAUTHORIZED" .env || echo "NODE_TLS_REJECT_UNAUTHORIZED=0" >> .env
grep -q "NODE_OPTIONS" .env || echo "NODE_OPTIONS=--tls-min-v1.2" >> .env

# Ensure Ghasedak API key is present
if [ -z "$GHASEDAK_API_KEY" ]; then
    echo "⚠️  Warning: GHASEDAK_API_KEY not found in environment"
    echo "Please add: GHASEDAK_API_KEY=your_api_key_here to .env"
fi

# Update OTP service with SSL fix
echo "🔄 Updating OTP service..."
cp services/otp-service.js services/otp-service.js.backup

# Use the SSL-fixed version
cp otp-service-ssl-fix.js services/otp-service.js

# Install required dependencies for proxy support
echo "📦 Installing dependencies..."
npm install https-proxy-agent http-proxy-agent --save

# Restart the service
echo "🚀 Restarting service..."
pm2 restart kiani-exchange

# Check service status
echo "✅ Service status:"
pm2 status kiani-exchange

echo "📊 Checking logs for SSL errors..."
sleep 5
pm2 logs kiani-exchange --lines 20 --timestamp 2>/dev/null | tail -10

echo ""
echo "🔍 To test the fix:"
echo "1. Ensure OTP_MOCK=0 in .env"
echo "2. Run: node test-endpoint.js"
echo "3. Check: pm2 logs kiani-exchange --lines 50"