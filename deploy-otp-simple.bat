@echo off
echo Deploying updated OTP service to remote server...
echo.

echo Creating services directory...
ssh -p 2222 root@185.235.41.85 "mkdir -p /root/ai-services-platform/services"

echo Uploading otp-service.js...
scp -P 2222 services/otp-service.js root@185.235.41.85:/root/ai-services-platform/services/

echo Restarting application...
ssh -p 2222 root@185.235.41.85 "cd /root/ai-services-platform && pm2 restart all"

echo Checking PM2 status...
ssh -p 2222 root@185.235.41.85 "pm2 status"

echo.
echo Deployment complete!
echo.
echo To test the updated OTP service:
echo ssh -p 2222 root@185.235.41.85
echo cd /root/ai-services-platform
echo node -e "const otp = require('./services/otp-service'); otp.requestOTP('09121958296').then(console.log);"