using FoodGappBackend_WebAPI.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static FoodGappBackend_WebAPI.Utils.Utilities;
using FoodGappBackend_WebAPI.Models.CustomModels;
using FoodGappBackend_WebAPI.Utils;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using System.Net.Mail;
using System.Net;

namespace FoodGappBackend_WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class AccountController : BaseController
    {
        IConfiguration _configuration;
        private readonly IWebHostEnvironment _webHostEnvironment;

        // Token-based password reset system (MERN-style)
        private static Dictionary<string, PasswordResetSession> _passwordResetSessions = new Dictionary<string, PasswordResetSession>();

        public AccountController(IConfiguration configuration, IWebHostEnvironment webHostEnvironment)
        {
            _configuration = configuration;
            _webHostEnvironment = webHostEnvironment;
        }

        // Password Reset Session with OTP code
        public class PasswordResetSession
        {
            public string Email { get; set; } = string.Empty;
            public string OtpCode { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
            public DateTime ExpiresAt { get; set; }
            public bool Verified { get; set; } = false;
            public int AttemptCount { get; set; } = 0;
            public bool Used { get; set; } = false; // <-- Add this line
        }

        // Request Models
        public class ForgotPasswordRequest
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;
        }

        public class VerifyResetCodeRequest
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            [StringLength(6, MinimumLength = 6)]
            public string Code { get; set; } = string.Empty;
        }

        public class ResetPasswordRequest
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            [MinLength(6)]
            public string NewPassword { get; set; } = string.Empty;

            [Required]
            [MinLength(6)]
            public string ConfirmPassword { get; set; } = string.Empty;
        }

        // Generate secure 6-digit OTP
        private string GenerateSecure6DigitOTP()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] bytes = new byte[4];
                rng.GetBytes(bytes);
                int randomNumber = Math.Abs(BitConverter.ToInt32(bytes, 0));
                return (randomNumber % 900000 + 100000).ToString(); // 6-digit number
            }
        }

        // Send OTP email using Gmail SMTP from appsettings.json
        private async Task<bool> SendOtpEmailAsync(string toEmail, string otpCode, DateTime expiresAt)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");
                var smtpServer = emailSettings["SmtpServer"];
                var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
                var fromEmail = emailSettings["FromEmail"];
                var fromName = emailSettings["FromName"];
                var username = emailSettings["Username"];
                var password = emailSettings["Password"];

                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine($"📧 Sending OTP email via: {smtpServer}:{smtpPort}");
                Console.WriteLine($"📤 From: {fromName} <{fromEmail}>");
                Console.WriteLine($"📨 To: {toEmail}");
                Console.WriteLine($"🔐 OTP Code: {otpCode}");
                Console.ResetColor();

                using var client = new SmtpClient(smtpServer, smtpPort);
                client.EnableSsl = true;
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(username, password);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail ?? username!, fromName),
                    Subject = "Your WellNu Password Reset Code",
                    IsBodyHtml = true,
                    Body = CreateOtpEmailHtml(toEmail, otpCode, expiresAt)
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("✅ OTP email sent successfully!");
                Console.ResetColor();

                return true;
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Failed to send OTP email: {ex.Message}");
                Console.ResetColor();
                return false;
            }
        }

        // Create beautiful HTML email with OTP code
        private string CreateOtpEmailHtml(string toEmail, string otpCode, DateTime expiresAt)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Your WellNu Password Reset Code</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
        <h1 style='color: white; margin: 0; font-size: 28px;'>� Password Reset Code</h1>
        <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;'>WellNu Nutrition Tracker</p>
    </div>
    
    <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
        <h2 style='color: #333; margin-top: 0;'>Hi there! 👋</h2>
        
        <p style='font-size: 16px; margin-bottom: 20px;'>
            You requested a password reset for your WellNu account (<strong>{toEmail}</strong>).
        </p>
        
        <p style='font-size: 16px; margin-bottom: 30px;'>
            Your 6-digit verification code is:
        </p>
        
        <div style='text-align: center; margin: 30px 0;'>
            <div style='background: #007AFF; color: white; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block; box-shadow: 0 4px 8px rgba(0,122,255,0.3);'>
                {otpCode}
            </div>
        </div>
        
        <div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;'>
            <p style='margin: 0; font-size: 14px; color: #856404;'>
                ⏰ <strong>This code expires at:</strong> {expiresAt:yyyy-MM-dd HH:mm:ss} UTC<br>
                � Enter this code in your WellNu app to reset your password<br>
                🔐 This code can only be used once
            </p>
        </div>
        
        <div style='background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0;'>
            <p style='margin: 0; font-size: 14px; color: #0c5460;'>
                💡 <strong>How to use this code:</strong><br>
                1. Open your WellNu app<br>
                2. Go to 'Forgot Password'<br>
                3. Enter this 6-digit code<br>
                4. Create your new password
            </p>
        </div>
        
        <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
        
        <p style='font-size: 14px; color: #666; margin-bottom: 10px;'>
            If you didn't request this password reset, please ignore this email. Your account is still secure.
        </p>
        
        <p style='font-size: 14px; color: #666; margin-bottom: 20px;'>
            Best regards,<br>
            <strong>The WellNu Team</strong> 🥗
        </p>
        
        <div style='text-align: center; padding-top: 20px; border-top: 1px solid #eee;'>
            <p style='font-size: 12px; color: #999; margin: 0;'>
                This email was sent from WellNu Nutrition Tracker<br>
                © 2025 WellNu. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>";
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] CustomUserLogin ul)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ul.Email) || string.IsNullOrWhiteSpace(ul.Password))
                {
                    return BadRequest(new { error = "Email and Password are required." });
                }

                if (_userMgr.SignIn(ul.Email, ul.Password, ref ErrorMessage) == ErrorCode.Success)
                {
                    var user = _userMgr.GetUserByEmail(ul.Email);
                    if (user == null)
                    {
                        return BadRequest(new { error = "User not found." });
                    }

                    var userRole = _userMgr.GetUsersRoleByUserId(user.UserId);
                    if (userRole == null)
                    {
                        return BadRequest(new { error = "UserRole not found." });
                    }

                    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Email ?? string.Empty),
                        new Claim(ClaimTypes.Name, user.UserId.ToString()),
                    };

                    var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var properties = new AuthenticationProperties
                    {
                        AllowRefresh = true,
                        IsPersistent = true,
                    };

                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        new ClaimsPrincipal(identity),
                        properties
                    );

                    var roleName = _userMgr.GetRoleNameByRoleId(userRole.RoleId);

                    return Ok(new { message = "Login successful", roleName = roleName.RoleName, userId = user.UserId });
                }

                return BadRequest(new { error = "Invalid login credentials" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during login: {ex.Message}");
                return StatusCode(500, new { error = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] BasicRegistration registration)
        {
            try
            {
                // Create user with only email and password
                var user = new User
                {
                    Email = registration.Email,
                    Password = registration.Password,
                    UserLevel = 1,
                    UserCurrentExperience = 0,
                    IsActive = true
                };

                if (_userMgr.CreateAccount(user, ref ErrorMessage) == ErrorCode.Success)
                {
                    var role = _roleRepo.GetAll().FirstOrDefault(r => r.RoleName == "User");

                    if (role == null)
                    {
                        return BadRequest(new { error = "Role 'User' not found" });
                    }

                    var userRole = new UserRole
                    {
                        UserId = user.UserId,
                        RoleId = role.RoleId
                    };

                    if (_userRoleRepo.Create(userRole, out ErrorMessage) == ErrorCode.Success)
                    {
                        return Ok(new { message = "Registration successful", userId = user.UserId });
                    }

                    return BadRequest(new { error = "Failed to assign user role", details = ErrorMessage });
                }

                return BadRequest(new { error = "Account registration failed", details = ErrorMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred", details = ex.Message });
            }
        }

        // Check Email Availability Endpoint
        [HttpGet("check-email/{email}")]
        public IActionResult CheckEmail(string email)
        {
            try
            {
                var normalizedEmail = email.ToLower().Trim();
                var existingUser = _userMgr.GetUserByEmail(normalizedEmail);
                var available = existingUser == null;

                return Ok(new { available = available });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Error checking email: " + ex.Message });
            }
        }

        // OTP-Style Forgot Password with Real Email Sending
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var email = request.Email.ToLower().Trim();

                // Check if user exists in your database
                var existingUser = _userMgr.GetUserByEmail(email);
                if (existingUser == null)
                {
                    // Don't reveal whether email exists or not for security
                    return Ok(new
                    {
                        success = true,
                        message = "If the email exists, a verification code has been sent.",
                        note = "Check your email inbox and spam folder for the 6-digit code."
                    });
                }

                // Generate secure 6-digit OTP
                var otpCode = GenerateSecure6DigitOTP();

                // Store OTP session (10-minute expiry)
                var session = new PasswordResetSession
                {
                    Email = email,
                    OtpCode = otpCode,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(10), // 10-minute expiry
                    Verified = false,
                    AttemptCount = 0
                };

                _passwordResetSessions[email] = session;

                // Send actual OTP email
                var emailSent = await SendOtpEmailAsync(email, otpCode, session.ExpiresAt);

                if (!emailSent)
                {
                    // Remove session if email failed
                    _passwordResetSessions.Remove(email);
                    return StatusCode(500, new
                    {
                        success = false,
                        message = "Failed to send verification email. Please try again later."
                    });
                }

                // Also log for development
                Console.WriteLine();
                Console.WriteLine("╔══════════════════════════════════════════════════════════════╗");
                Console.WriteLine("║              PASSWORD RESET OTP EMAIL SENT! 📧              ║");
                Console.WriteLine("╠══════════════════════════════════════════════════════════════╣");
                Console.WriteLine($"║ To: {email,-56} ║");
                Console.WriteLine($"║ OTP Code: {otpCode,-53} ║");
                Console.WriteLine($"║ Expires: {session.ExpiresAt:yyyy-MM-dd HH:mm:ss} UTC{"",-27} ║");
                Console.WriteLine("╚══════════════════════════════════════════════════════════════╝");
                Console.WriteLine();

                return Ok(new
                {
                    success = true,
                    message = "6-digit verification code sent to your email! Check your inbox.",
                    // In development, include the OTP for testing
                    otpCode = _webHostEnvironment.IsDevelopment() ? otpCode : null
                });
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ ERROR in ForgotPassword: {ex.Message}");
                Console.ResetColor();
                return StatusCode(500, new { success = false, message = "Error sending verification email: " + ex.Message });
            }
        }

        // Verify OTP Code Only (without resetting password)
        [HttpPost("verify-reset-code")]
        public IActionResult VerifyResetCode([FromBody] VerifyResetCodeRequest request)
        {
            try
            {
                var email = request.Email.ToLower().Trim();
                var code = request.Code.Trim();

                Console.WriteLine($"🔍 Verify Reset Code Request: Email={email}, Code={code}");

                // Find session by email
                if (!_passwordResetSessions.TryGetValue(email, out var session))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "No password reset session found. Please request a new verification code."
                    });
                }

                // Check if session is expired
                if (DateTime.UtcNow > session.ExpiresAt)
                {
                    _passwordResetSessions.Remove(email);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Verification code has expired. Please request a new code."
                    });
                }

                // Check if already verified
                if (session.Verified)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "This verification code has already been used. Please request a new code."
                    });
                }

                // Increment attempt count
                session.AttemptCount++;

                // Check attempt limit (5 attempts max)
                if (session.AttemptCount > 5)
                {
                    _passwordResetSessions.Remove(email);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Too many failed attempts. Please request a new verification code."
                    });
                }

                // Verify OTP code
                if (session.OtpCode != code)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Invalid verification code. {5 - session.AttemptCount} attempts remaining."
                    });
                }

                // Mark as verified but don't remove session yet
                session.Verified = true;

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"✅ OTP VERIFICATION SUCCESSFUL for: {email}");
                Console.ResetColor();

                return Ok(new
                {
                    success = true,
                    message = "Verification code confirmed! You can now set your new password."
                });
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error in VerifyResetCode: {ex.Message}");
                Console.ResetColor();
                return StatusCode(500, new { success = false, message = "Error verifying code: " + ex.Message });
            }
        }

        // Reset Password (after OTP verification)
        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var email = request.Email.ToLower().Trim();
                var newPassword = request.NewPassword.Trim();
                var confirmPassword = request.ConfirmPassword.Trim();

                // Debug logging
                Console.WriteLine($"🔍 Reset Password Request: Email={email}");
                Console.WriteLine($"📋 Active sessions: {_passwordResetSessions.Count}");
                foreach (var kvp in _passwordResetSessions)
                {
                    Console.WriteLine($"   Session: {kvp.Key} -> Verified: {kvp.Value.Verified} (expires: {kvp.Value.ExpiresAt})");
                }

                // Validate password confirmation
                if (newPassword != confirmPassword)
                {
                    return BadRequest(new { success = false, message = "Passwords do not match." });
                }

                // Find session by email
                if (!_passwordResetSessions.TryGetValue(email, out var session))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "No password reset session found. Please verify your code first."
                    });
                }

                // Check if session is expired
                if (DateTime.UtcNow > session.ExpiresAt)
                {
                    // Remove expired session
                    _passwordResetSessions.Remove(email);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Verification session has expired. Please request a new code."
                    });
                }

                // Check if code was verified in previous step
                if (!session.Verified)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Please verify your code first before resetting password."
                    });
                }

                // Check if user still exists
                var existingUser = _userMgr.GetUserByEmail(email);
                if (existingUser == null)
                {
                    _passwordResetSessions.Remove(email);
                    return BadRequest(new { success = false, message = "User account no longer exists." });
                }

                // Update password
                existingUser.Password = Utilities.PasswordHelper.HashPassword(newPassword);

                if (_userMgr.UpdateUser(existingUser, ref ErrorMessage) != ErrorCode.Success)
                {
                    return BadRequest(new { success = false, message = "Failed to update password: " + ErrorMessage });
                }

                // Mark session as verified and clean up
                session.Verified = true;
                _passwordResetSessions.Remove(email);

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"🎉 PASSWORD RESET SUCCESSFUL for: {email} using 6-digit OTP");
                Console.ResetColor();

                return Ok(new { success = true, message = "Password has been reset successfully. You can now log in with your new password." });
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error in ResetPassword: {ex.Message}");
                Console.ResetColor();
                return StatusCode(500, new { success = false, message = "Error resetting password: " + ex.Message });
            }
        }

        // Validate Reset Token (for frontend to check if token is valid before showing reset form)
        [HttpGet("validate-reset-token/{token}")]
        public IActionResult ValidateResetToken(string token)
        {
            try
            {
                if (!_passwordResetSessions.ContainsKey(token))
                {
                    return BadRequest(new { valid = false, message = "Invalid reset token." });
                }

                var session = _passwordResetSessions[token];

                if (DateTime.UtcNow > session.ExpiresAt)
                {
                    _passwordResetSessions.Remove(token);
                    return BadRequest(new { valid = false, message = "Reset token has expired." });
                }

                if (session.Used)
                {
                    return BadRequest(new { valid = false, message = "Reset token has already been used." });
                }

                return Ok(new
                {
                    valid = true,
                    email = session.Email,
                    expiresAt = session.ExpiresAt
                });
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"❌ Error validating reset token: {ex.Message}");
                Console.ResetColor();
                return StatusCode(500, new { valid = false, message = "Error validating token: " + ex.Message });
            }
        }

        // Add this class at the bottom of the file
        public class BasicRegistration
        {
            public required string Email { get; set; }
            public required string Password { get; set; }
        }

        [HttpPost("updateAccount")]
        public IActionResult UpdateUserAccount([FromBody] User user)
        {
            if (!User.Identity?.IsAuthenticated ?? false || UserId == 0)
            {
                return BadRequest(new { error = "User is not authenticated" });
            }

            var existingUser = _userMgr.GetUserById(UserId);
            if (existingUser == null)
            {
                return BadRequest(new { error = "User not found" });
            }

            // Only update allowed fields
            existingUser.FirstName = user.FirstName;
            existingUser.LastName = user.LastName;
            existingUser.Age = user.Age;
            existingUser.Weight = user.Weight;
            existingUser.Height = user.Height;
            existingUser.BodyGoalId = user.BodyGoalId;

            // Gender: expect 0 for Male, 1 for Female, 2 for Others, null or other for unspecified
            if (user.Gender == 0 || user.Gender == 1 || user.Gender == 2)
                existingUser.Gender = user.Gender;
            else
                existingUser.Gender = null;

            // Do NOT update Email, IsActive, or Password

            if (_userMgr.UpdateUser(existingUser, ref ErrorMessage) != ErrorCode.Success)
            {
                return BadRequest(new { error = "Updating User was failed", details = ErrorMessage });
            }

            return Ok(new { message = "Updating User successful" });
        }

        [HttpGet("getProfile")]
        public IActionResult GetProfile([FromQuery] int userId)
        {
            var user = _userMgr.GetUserById(userId);
            if (user == null)
                return NotFound(new { error = "User not found" });

            int userLevel = user.UserLevel ?? 1;
            int userCurrentExperience = user.UserCurrentExperience ?? 0;

            return Ok(new
            {
                userInfo = new
                {
                    userId = user.UserId,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    age = user.Age,
                    gender = user.Gender, // returns 0 for Male, 1 for Female, 2 for Others, null for unspecified
                    weight = user.Weight,
                    height = user.Height,
                    bodyGoalId = user.BodyGoalId,
                    userLevel = user.UserLevel ?? 1,
                    userCurrentExperience = user.UserCurrentExperience ?? 0,
                    experienceToNextLevel = _userMgr.GetExperienceToNextLevel(user)
                }
            });
        }

        [HttpPost("changePassword")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!User.Identity?.IsAuthenticated ?? false || UserId == 0)
            {
                return BadRequest(new { error = "User is not authenticated" });
            }

            if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { error = "Current password and new password are required" });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new { error = "New password must be at least 6 characters long" });
            }

            var existingUser = _userMgr.GetUserById(UserId);
            if (existingUser == null)
            {
                return BadRequest(new { error = "User not found" });
            }

            // Verify current password using hash verification
            if (!Utilities.PasswordHelper.VerifyPassword(request.CurrentPassword, existingUser.Password ?? ""))
            {
                return BadRequest(new { error = "Current password is incorrect" });
            }

            // Hash the new password before storing
            existingUser.Password = Utilities.PasswordHelper.HashPassword(request.NewPassword);

            if (_userMgr.UpdateUser(existingUser, ref ErrorMessage) != ErrorCode.Success)
            {
                return BadRequest(new { error = "Failed to update password", details = ErrorMessage });
            }

            return Ok(new { message = "Password updated successfully" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            return Ok(new { message = "Logout successful" });
        }

        [HttpDelete("deleteAccount")]
        public IActionResult DeleteUserAccount(int id)
        {
            if (!User.Identity?.IsAuthenticated ?? false || UserId == 0)
            {
                return BadRequest(new { error = "User is not authenticated" });
            }

            var loginUser = _userMgr.GetUserById(UserId);
            if (loginUser == null)
            {
                return BadRequest(new { error = "User not found" });
            }

            loginUser.IsActive = false;

            if (_userMgr.UpdateUser(loginUser, ref ErrorMessage) != ErrorCode.Success)
            {
                return BadRequest(new { error = "Deactivating User failed", details = ErrorMessage });
            }

            return Ok(new { message = "User deactivated successfully" });
        }

        [HttpPost("updateUserInfo")]
        public IActionResult UpdateUserInfo([FromBody] User user)
        {
            if (!User.Identity?.IsAuthenticated ?? false || UserId == 0)
            {
                return BadRequest(new { error = "User is not authenticated" });
            }

            user.UserId = UserId;

            if (_userMgr.UpdateUser(user, ref ErrorMessage) != ErrorCode.Success)
            {
                return BadRequest(new { error = "Updating User failed", details = ErrorMessage });
            }

            return Ok(new { message = "Updating User successful" });
        }

        [HttpPost("createUserInfo")]
        public IActionResult CreateUserInfo([FromBody] User user)
        {
            if (!User.Identity?.IsAuthenticated ?? false || UserId == 0)
            {
                return BadRequest(new { error = "User is not authenticated" });
            }

            // Get the existing user that was created during registration
            var existingUser = _userMgr.GetUserById(UserId);
            if (existingUser == null)
            {
                return BadRequest(new { error = "User not found" });
            }

            // Update the existing user with profile information
            existingUser.FirstName = user.FirstName;
            existingUser.LastName = user.LastName;
            existingUser.Age = user.Age;
            existingUser.Weight = user.Weight;
            existingUser.Height = user.Height;
            existingUser.BodyGoalId = user.BodyGoalId;
            existingUser.Gender = user.Gender; // Handle gender field
            existingUser.UserLevel ??= 1;
            existingUser.UserCurrentExperience ??= 0;

            // Use UpdateUser instead of CreateAccount
            if (_userMgr.UpdateUser(existingUser, ref ErrorMessage) != ErrorCode.Success)
            {
                return BadRequest(new { error = "User profile update failed", details = ErrorMessage });
            }

            return Ok(new { message = "User profile created successfully" });
        }

        [HttpPost("add-experience")]
        public IActionResult AddExperience([FromBody] AddExperienceRequest request)
        {
            var user = _userMgr.GetUserById(request.UserId);
            if (user == null)
                return NotFound();

            _userMgr.AddExperience(user, request.Experience);
            var result = _userMgr.UpdateUser(user, ref ErrorMessage);

            if (result != ErrorCode.Success)
                return BadRequest(new { error = ErrorMessage });

            return Ok(new
            {
                userId = user.UserId,
                userLevel = user.UserLevel,
                userCurrentExperience = user.UserCurrentExperience,
                experienceToNextLevel = _userMgr.GetExperienceToNextLevel(user)
            });
        }

        [HttpGet("badges")]
        public IActionResult GetBadges(int userId)
        {
            // TODO: Integrate with gamification logic or return mock data
            return Ok(new[] { new { badge = "Consistent Logger", earned = true, date = DateTime.Now } });
        }

        [HttpPost("log-cebu-food")]
        public IActionResult LogCebuFood([FromBody] object foodData)
        {
            // TODO: Integrate with Cebu food logic or return mock data
            return Ok(new { logged = true, dish = "Adobo", culturalRelevance = true });
        }

        [HttpGet("user-level/{userId}")]
        public IActionResult GetUserLevel(int userId)
        {
            var user = _userMgr.GetUserById(userId);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                level = user.UserLevel ?? 1,
                currentXP = user.UserCurrentExperience ?? 0,
                requiredXP = _userMgr.GetExperienceToNextLevel(user),
                title = $"Level {user.UserLevel ?? 1}",
                badge = "" // optional, you can add logic for badges here
            });
        }

        // Development endpoints - remove in production
        [HttpGet("dev/reset-sessions")]
        public IActionResult GetAllResetSessions()
        {
            var displaySessions = _passwordResetSessions.ToDictionary(
                kvp => kvp.Key,
                kvp => new {
                    token = kvp.Key,
                    email = kvp.Value.Email,
                    createdAt = kvp.Value.CreatedAt,
                    expiresAt = kvp.Value.ExpiresAt,
                    used = kvp.Value.Used,
                    isExpired = DateTime.UtcNow > kvp.Value.ExpiresAt
                }
            );

            return Ok(displaySessions);
        }

        [HttpPost("dev/clear-reset-sessions")]
        public IActionResult ClearResetSessions()
        {
            _passwordResetSessions.Clear();
            return Ok(new { message = "All password reset sessions cleared." });
        }
    }

    public class AddExperienceRequest
    {
        public int UserId { get; set; }
        public int Experience { get; set; }
    }

    public class ChangePasswordRequest
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}
