#!/bin/bash

echo "🚀 Deploying OTP routes fix to server..."

# Server details
SERVER="kianirad2020@34.169.105.176"
PORT="22"
REMOTE_PATH="/home/kianirad2020/ai-services-platform"

echo "📁 Creating routes directory if it doesn't exist..."
ssh $SERVER "mkdir -p $REMOTE_PATH/routes"

echo "📤 Uploading new OTP routes..."
scp routes/otp-routes.js $SERVER:$REMOTE_PATH/routes/

echo "📤 Uploading updated server.js..."
scp server.js $SERVER:$REMOTE_PATH/

echo "🔧 Restarting the application..."
ssh $SERVER "cd $REMOTE_PATH && pm2 restart kiani-exchange"

echo "✅ OTP routes fix deployment completed!"
echo "🔍 Checking PM2 status..."
ssh $SERVER "pm2 status"

echo ""
echo "📋 To test the fix:"
echo "curl -X POST https://kiani.exchange/api/otp/verify -H 'Content-Type: application/json' -d '{\"phoneNumber\":\"09121958296\",\"otp\":\"123456\"}'"
echo ""
echo "Both endpoints should now work:"
echo "- /api/auth/verify-otp (existing)"
echo "- /api/otp/verify (new)"