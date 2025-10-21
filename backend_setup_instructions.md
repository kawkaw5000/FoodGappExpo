# ASP.NET Backend Setup Instructions

## Option 1: If you have the ASP.NET project ready
```bash
cd YourASP.NETProject
dotnet run --urls="http://0.0.0.0:5129"
```

## Option 2: Create a minimal ASP.NET project for testing
```bash
# Create new ASP.NET project
dotnet new webapi -n WellNuBackend
cd WellNuBackend

# Replace Program.cs and add your AccountController
# Then run:
dotnet run --urls="http://0.0.0.0:5129"
```

## Option 3: Quick Test Controller (Minimal Setup)
If you want to test quickly, create a simple ASP.NET project with just the AccountController.

Your AccountController_Modified.cs contains everything needed for OTP functionality.

## What Should Happen:
1. ASP.NET backend runs on http://192.168.254.148:5129
2. Frontend calls /api/account/forgot-password 
3. Backend generates OTP and logs it to console
4. You copy OTP from backend console to app
5. Frontend calls /api/account/verify-reset-code
6. Frontend calls /api/account/reset-password

## No Python Changes Needed!
Your Python backend (maintest.py) handles nutrition/AI chat.
Your ASP.NET backend handles authentication/OTP.
They work together but serve different purposes.

## Troubleshooting Steps:
1. Run test_backends.bat to check if both backends are accessible
2. Check Windows Firewall settings
3. Verify IP address matches your computer's IP
4. Make sure ASP.NET backend is running on port 5129
5. Check backend console for OTP codes when testing
