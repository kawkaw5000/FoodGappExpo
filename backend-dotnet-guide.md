# ASP.NET Core Backend Implementation Guide

## Setup Instructions

### 1. Create ASP.NET Core Project
```bash
dotnet new webapi -n WellNuAPI
cd WellNuAPI
```

### 2. Install Required Packages
```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package MailKit
dotnet add package MimeKit
```

### 3. Update appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=WellNuDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "WellNu Team"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### 4. Create Models/User.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace WellNuAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

### 5. Create Models/ResetCode.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace WellNuAPI.Models
{
    public class ResetCode
    {
        public int Id { get; set; }
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Code { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }
        public bool Used { get; set; } = false;
    }
}
```

### 6. Create Data/ApplicationDbContext.cs
```csharp
using Microsoft.EntityFrameworkCore;
using WellNuAPI.Models;

namespace WellNuAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ResetCode> ResetCodes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
```

### 7. Create Services/IEmailService.cs
```csharp
namespace WellNuAPI.Services
{
    public interface IEmailService
    {
        Task<bool> SendResetCodeAsync(string email, string code);
    }
}
```

### 8. Create Services/EmailService.cs
```csharp
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;

namespace WellNuAPI.Services
{
    public class EmailSettings
    {
        public string SmtpServer { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task<bool> SendResetCodeAsync(string email, string code)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
                message.To.Add(new MailboxAddress("", email));
                message.Subject = "WellNu Password Reset Code";

                var bodyBuilder = new BodyBuilder
                {
                    TextBody = $@"
Hello,

Your password reset code is: {code}

This code will expire in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
WellNu Team"
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", email);
                return false;
            }
        }
    }
}
```

### 9. Create DTOs/ForgotPasswordRequest.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace WellNuAPI.DTOs
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
```

### 10. Create DTOs/VerifyResetCodeRequest.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace WellNuAPI.DTOs
{
    public class VerifyResetCodeRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Code { get; set; } = string.Empty;
    }
}
```

### 11. Create Controllers/AuthController.cs
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellNuAPI.Data;
using WellNuAPI.DTOs;
using WellNuAPI.Models;
using WellNuAPI.Services;
using System.Security.Cryptography;
using System.Text;

namespace WellNuAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ApplicationDbContext context, IEmailService emailService, ILogger<AuthController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Email not found" });
                }

                // Generate 6-digit code
                var random = new Random();
                var code = random.Next(100000, 999999).ToString();

                var resetCode = new ResetCode
                {
                    Email = request.Email,
                    Code = code,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(15)
                };

                _context.ResetCodes.Add(resetCode);
                await _context.SaveChangesAsync();

                // Send email
                var emailSent = await _emailService.SendResetCodeAsync(request.Email, code);
                if (!emailSent)
                {
                    return StatusCode(500, new { success = false, message = "Failed to send email" });
                }

                return Ok(new { success = true, message = "Reset code sent to your email" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ForgotPassword");
                return StatusCode(500, new { success = false, message = "Failed to send reset code" });
            }
        }

        [HttpPost("verify-reset-code")]
        public async Task<IActionResult> VerifyResetCode([FromBody] VerifyResetCodeRequest request)
        {
            try
            {
                var resetCode = await _context.ResetCodes
                    .FirstOrDefaultAsync(rc => rc.Email == request.Email 
                                            && rc.Code == request.Code 
                                            && !rc.Used 
                                            && rc.ExpiresAt > DateTime.UtcNow);

                if (resetCode == null)
                {
                    return BadRequest(new { success = false, message = "Invalid or expired code" });
                }

                // Mark code as used
                resetCode.Used = true;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Code verified successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in VerifyResetCode");
                return StatusCode(500, new { success = false, message = "Failed to verify code" });
            }
        }
    }
}
```

### 12. Update Program.cs
```csharp
using Microsoft.EntityFrameworkCore;
using WellNuAPI.Data;
using WellNuAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Create database if it doesn't exist
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
```

### 13. Run Migrations
```bash
dotnet ef migrations add AddResetCodeTable
dotnet ef database update
```

### 14. Run the API
```bash
dotnet run
```

## SQL Server Setup (Alternative to Entity Framework):

### Create Tables Manually:
```sql
-- Users table (if not exists)
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Reset codes table
CREATE TABLE ResetCodes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    Code NVARCHAR(6) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ExpiresAt DATETIME2 NOT NULL,
    Used BIT DEFAULT 0
);
```

## API Endpoints:
- POST `/api/auth/forgot-password` - Send reset code
- POST `/api/auth/verify-reset-code` - Verify code

## Email Setup (Same as Python):
1. Use Gmail App Password
2. Update EmailSettings in appsettings.json
3. For other providers, update SmtpServer and SmtpPort
