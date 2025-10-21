# Email Validation and OTP System Implementation

## Overview
This implementation provides a comprehensive email validation and OTP (One-Time Password) system for your FoodGapp Expo application, including:

- **Email validation during registration** with real-time feedback
- **Password reset functionality** with OTP verification
- **Dual backend support** (ASP.NET production + EmailService development fallback)
- **Visual feedback indicators** for email validation states

## Components Implemented

### 1. Enhanced Registration Screen (`registerScreen.tsx`)
**Features Added:**
- Real-time email format validation
- Email availability checking
- Visual feedback (green checkmark, red X, loading indicator)
- Status messages below email input
- Enhanced validation before registration submission

**Visual Indicators:**
- ✅ Green checkmark: Email is valid and available
- ❌ Red X: Invalid email format or already registered
- ⏳ Loading: Checking email availability
- Status messages appear below the email input field

### 2. EmailService Utility (`services/EmailService.ts`)
**Capabilities:**
- Generate 6-digit OTP codes
- Email format validation
- OTP storage and verification (local storage for development)
- Email simulation for development
- Password reset flow management
- Time-based OTP expiration (10 minutes)

**Methods:**
```typescript
EmailService.generateOTP()                    // Generate 6-digit code
EmailService.validateEmailFormat(email)       // Validate email format
EmailService.requestPasswordReset(email)      // Send OTP for password reset
EmailService.verifyPasswordResetCode(email, code) // Verify OTP code
EmailService.completePasswordReset(email, code, newPassword) // Complete reset
```

### 3. Enhanced Forgot Password Screen (`ForgotPasswordScreen.tsx`)
**Features:**
- Integrates with both backend and EmailService
- Progressive UI (send code → verify code → set new password)
- Real-time validation feedback
- Fallback to development mode if backend unavailable
- Visual step indicators

### 4. Backend API Controller (`backend_controllers/AccountController.cs`)
**Endpoints Added:**
- `POST /api/account/forgot-password` - Request password reset OTP
- `POST /api/account/verify-reset-code` - Verify OTP code
- `POST /api/account/reset-password` - Complete password reset
- `GET /api/account/check-email/{email}` - Check email availability
- Enhanced register/login endpoints

## Setup Instructions

### Frontend Setup (Already Implemented)
The frontend components have been updated with email validation and OTP functionality. The system automatically falls back to development mode if the backend is unavailable.

### Backend Setup (ASP.NET Core)
1. **Add the AccountController to your ASP.NET project:**
   ```bash
   # Copy the AccountController.cs file to your Controllers directory
   cp backend_controllers/AccountController.cs YourProject/Controllers/
   ```

2. **Update your Program.cs or Startup.cs:**
   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowAll",
           policy =>
           {
               policy.AllowAnyOrigin()
                     .AllowAnyMethod()
                     .AllowAnyHeader();
           });
   });

   // Add after building the app
   app.UseCors("AllowAll");
   ```

3. **Start your ASP.NET backend:**
   ```bash
   cd YourBackendProject
   dotnet run --urls="http://0.0.0.0:5129"
   ```

### Email Service Setup (Production)
For production, you'll need to implement actual email sending:

1. **Install email service (example with SendGrid):**
   ```bash
   npm install @sendgrid/mail
   # or
   dotnet add package SendGrid
   ```

2. **Replace simulation in EmailService.ts:**
   ```typescript
   // Replace the sendOTPEmail method with actual email API calls
   static async sendOTPEmail(email: string, code: string): Promise<boolean> {
     try {
       const response = await fetch(`${Config.API_BASE}/api/email/send-otp`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, code, type: 'password-reset' })
       });
       return response.ok;
     } catch (error) {
       console.error('Error sending email:', error);
       return false;
     }
   }
   ```

## Testing Guide

### 1. Test Email Validation (Registration)
1. Navigate to registration screen
2. **Test invalid emails:**
   - `test` → Should show red X and "Please enter a valid email address"
   - `test@` → Should show red X and error message
   - `test@domain` → Should show red X and error message

3. **Test valid emails:**
   - `test@example.com` → Should show loading, then green checkmark and "Email is available"
   - Try registering with the same email again → Should show red X and "This email is already registered"

### 2. Test Password Reset Flow
1. Navigate to login screen → Tap "Forgot password?"
2. **Test email validation:**
   - Enter invalid email → Error alert
   - Enter valid email → Tap "Send Code"

3. **In development mode, check console for OTP:**
   ```
   === PASSWORD RESET EMAIL ===
   To: user@example.com
   Your verification code is: 123456
   =============================
   ```

4. **Test OTP verification:**
   - Enter wrong code → Error message
   - Enter correct code → Success, unlock password fields
   - Enter new password and confirm → Success message

### 3. Test Backend Integration
1. **Check backend endpoints:**
   ```bash
   # Test email availability
   curl http://192.168.254.148:5129/api/account/check-email/test@example.com

   # Test password reset
   curl -X POST http://192.168.254.148:5129/api/account/forgot-password \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com"}'
   ```

2. **Development endpoints (remove in production):**
   ```bash
   # View all users
   curl http://192.168.254.148:5129/api/account/dev/users

   # View all OTPs
   curl http://192.168.254.148:5129/api/account/dev/otps

   # Clear all data
   curl -X POST http://192.168.254.148:5129/api/account/dev/clear
   ```

## Security Features

### Email Validation
- Real-time format validation
- Duplicate email prevention
- Sanitization (lowercase, trim)

### OTP Security
- 6-digit numeric codes
- 10-minute expiration
- One-time use verification
- Secure storage with timestamps

### Password Reset Security
- OTP must be verified before password change
- No user enumeration (same response for existing/non-existing emails)
- Automatic cleanup of expired OTPs
- Minimum password length enforcement

## Development vs Production

### Development Mode Features
- Console logging of OTPs
- Local storage for OTP verification
- Fallback when backend unavailable
- Debug information in alerts

### Production Considerations
1. **Replace local storage** with database storage
2. **Implement real email service** (SendGrid, AWS SES, etc.)
3. **Add password hashing** (bcrypt, scrypt)
4. **Remove debug endpoints** and console logs
5. **Add rate limiting** for OTP requests
6. **Implement proper user database** with foreign keys
7. **Add logging and monitoring**

## Troubleshooting

### Common Issues
1. **Email validation not working:**
   - Check Config.tsx BASE_IP matches your computer's IP
   - Ensure ASP.NET backend is running on port 5129

2. **OTP not received:**
   - In development, check console output for simulated email
   - Verify EmailService is generating codes correctly

3. **Backend connection issues:**
   - System automatically falls back to EmailService for development
   - Check network connectivity and firewall settings

### Debug Commands
```bash
# Check if backend is running
curl http://192.168.254.148:5129/api/account/dev/users

# Test email validation
curl http://192.168.254.148:5129/api/account/check-email/test@example.com

# View OTP storage (development)
curl http://192.168.254.148:5129/api/account/dev/otps
```

## Next Steps

1. **Test the complete flow** with the updated frontend
2. **Set up the ASP.NET backend** with the provided controller
3. **Implement production email service** when ready to deploy
4. **Add additional security measures** as needed
5. **Consider user experience enhancements** like OTP countdown timers

The system is designed to work immediately in development mode and scale to production with minimal changes to the frontend code.
