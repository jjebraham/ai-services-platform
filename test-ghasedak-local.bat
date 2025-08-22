@echo off
echo Testing Ghasedak OTP API from local machine...
echo.
echo Mobile: 09121958296
echo Template: ghasedak2
echo OTP Code: 123456
echo.
echo Sending request...
echo.

curl -v -X POST "https://gateway.ghasedak.me/rest/api/v1/WebService/SendOtpWithParams" ^
  -H "Content-Type: application/json" ^
  -H "ApiKey: e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3wCJddwRUFwY" ^
  -d "{\"receptors\":[{\"mobile\":\"09121958296\",\"clientReferenceId\":\"test_local_123\"}],\"templateName\":\"ghasedak2\",\"param1\":\"123456\",\"isVoice\":false,\"udh\":false}"

echo.
echo Test completed.
pause