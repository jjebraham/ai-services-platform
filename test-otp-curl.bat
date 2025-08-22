@echo off
echo Testing OTP API endpoints...
echo.

echo 1. Testing send-otp endpoint...
curl -X POST https://kiani.exchange/api/auth/send-otp ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"09121958296\"}" ^
  -w "\nHTTP Status: %{http_code}\n"

echo.
echo.
echo 2. Testing verify-otp endpoint (with test OTP 128288)...
curl -X POST https://kiani.exchange/api/auth/verify-otp ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"09121958296\",\"otp\":\"128288\"}" ^
  -w "\nHTTP Status: %{http_code}\n"

echo.
echo Test completed.
pause