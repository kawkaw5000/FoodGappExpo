@echo off
echo Testing ASP.NET Backend Connection...
echo.

REM Test if backend is running
curl -X GET "http://192.168.254.148:5129/health" -H "Content-Type: application/json" --max-time 10
if errorlevel 1 (
    echo ❌ ASP.NET Backend is NOT running or not accessible
    echo.
    echo Please:
    echo 1. Start your ASP.NET backend
    echo 2. Make sure it's running on port 5129
    echo 3. Check firewall settings
    echo 4. Verify IP address 192.168.254.148 is correct
) else (
    echo ✅ ASP.NET Backend is running!
    echo.
    echo Testing OTP endpoint...
    curl -X POST "http://192.168.254.148:5129/api/account/forgot-password" ^
         -H "Content-Type: application/json" ^
         -d "{\"email\":\"test@example.com\"}" ^
         --max-time 10
)

echo.
echo Testing Python Backend...
curl -X GET "http://192.168.254.148:5000/health" -H "Content-Type: application/json" --max-time 10

pause
