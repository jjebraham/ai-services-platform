#!/bin/bash

echo "🚀 Deploying updated OTP service to server..."

# Server details
SERVER="root@185.235.41.83"
PORT="2222"
REMOTE_PATH="/root/ai-services-platform"

echo "📁 Creating services directory if it doesn't exist..."
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/services"

echo "📤 Uploading updated OTP service..."
scp -P $PORT services/otp-service.js $SERVER:$REMOTE_PATH/services/

echo "🔧 Restarting the application..."
ssh -p $PORT $SERVER "cd $REMOTE_PATH && pm2 restart all || pm2 start ecosystem.config.js"

echo "✅ OTP service deployment completed!"
echo "🔍 Checking PM2 status..."
ssh -p $PORT $SERVER "pm2 status"

echo ""
echo "📋 To test the updated OTP service:"
echo "ssh -p $PORT $SERVER"
echo "cd $REMOTE_PATH"
echo "node -e \"const otp = require('./services/otp-service'); otp.requestOTP('09121958296').then(console.log);\""