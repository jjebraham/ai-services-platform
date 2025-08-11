# Deploy updated OTP service to server
Write-Host "🚀 Deploying updated OTP service to server..." -ForegroundColor Green

# Server details
$SERVER = "root@185.235.41.83"
$PORT = "2222"
$REMOTE_PATH = "/root/ai-services-platform"

Write-Host "📁 Creating services directory if it doesn't exist..." -ForegroundColor Yellow
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/services"

Write-Host "📤 Uploading updated OTP service..." -ForegroundColor Yellow
scp -P $PORT services/otp-service.js "${SERVER}:${REMOTE_PATH}/services/"

Write-Host "🔧 Restarting the application..." -ForegroundColor Yellow
ssh -p $PORT $SERVER "cd $REMOTE_PATH && pm2 restart all || pm2 start ecosystem.config.js"

Write-Host "✅ OTP service deployment completed!" -ForegroundColor Green
Write-Host "🔍 Checking PM2 status..." -ForegroundColor Yellow
ssh -p $PORT $SERVER "pm2 status"

Write-Host ""
Write-Host "📋 To test the updated OTP service:" -ForegroundColor Cyan
Write-Host "ssh -p $PORT $SERVER" -ForegroundColor White
Write-Host "cd $REMOTE_PATH" -ForegroundColor White
Write-Host "Test command:" -ForegroundColor White
Write-Host "node -e `"const otp = require('./services/otp-service'); otp.requestOTP('09121958296').then(console.log);`"" -ForegroundColor Yellow