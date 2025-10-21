import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "@/constants/Config";

export interface OTPData {
  code: string;
  email: string;
  expiresAt: number;
  verified: boolean;
}

export class EmailService {
  private static readonly OTP_EXPIRY_MINUTES = 10;
  private static readonly OTP_STORAGE_KEY = 'otp_data';

  /**
   * Generates a 6-digit OTP code
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validates email format
   */
  static validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Stores OTP data locally (for development/testing)
   * In production, this would be handled by backend
   */
  static async storeOTP(email: string, code: string): Promise<void> {
    try {
      const expiresAt = Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000);
      const otpData: OTPData = {
        code,
        email: email.toLowerCase().trim(),
        expiresAt,
        verified: false
      };
      
      await AsyncStorage.setItem(this.OTP_STORAGE_KEY, JSON.stringify(otpData));
      console.log(`OTP stored for ${email}: ${code} (expires at ${new Date(expiresAt)})`);
    } catch (error) {
      console.error('Error storing OTP:', error);
      throw new Error('Failed to store OTP');
    }
  }

  /**
   * Retrieves stored OTP data
   */
  static async getStoredOTP(): Promise<OTPData | null> {
    try {
      const storedData = await AsyncStorage.getItem(this.OTP_STORAGE_KEY);
      if (!storedData) return null;
      
      const otpData: OTPData = JSON.parse(storedData);
      
      // Check if OTP has expired
      if (Date.now() > otpData.expiresAt) {
        await this.clearOTP();
        return null;
      }
      
      return otpData;
    } catch (error) {
      console.error('Error retrieving OTP:', error);
      return null;
    }
  }

  /**
   * Verifies OTP code
   */
  static async verifyOTP(email: string, code: string): Promise<boolean> {
    try {
      const storedOTP = await this.getStoredOTP();
      
      if (!storedOTP) {
        console.log('No OTP found or OTP expired');
        return false;
      }
      
      if (storedOTP.email !== email.toLowerCase().trim()) {
        console.log('Email mismatch');
        return false;
      }
      
      if (storedOTP.code !== code.trim()) {
        console.log('Code mismatch');
        return false;
      }
      
      // Mark as verified
      storedOTP.verified = true;
      await AsyncStorage.setItem(this.OTP_STORAGE_KEY, JSON.stringify(storedOTP));
      
      console.log(`OTP verified successfully for ${email}`);
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  /**
   * Clears stored OTP data
   */
  static async clearOTP(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.OTP_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing OTP:', error);
    }
  }

  /**
   * Checks if OTP is verified and not expired
   */
  static async isOTPVerified(email: string): Promise<boolean> {
    try {
      const storedOTP = await this.getStoredOTP();
      return storedOTP?.email === email.toLowerCase().trim() && storedOTP.verified === true;
    } catch (error) {
      console.error('Error checking OTP verification:', error);
      return false;
    }
  }

  /**
   * Formats time remaining for OTP expiry
   */
  static async getOTPTimeRemaining(): Promise<string | null> {
    try {
      const storedOTP = await this.getStoredOTP();
      if (!storedOTP) return null;
      
      const timeRemaining = storedOTP.expiresAt - Date.now();
      if (timeRemaining <= 0) return null;
      
      const minutes = Math.floor(timeRemaining / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error getting OTP time remaining:', error);
      return null;
    }
  }

  /**
   * Simulates sending email (for development)
   * In production, this would call your email service API
   */
  static async sendOTPEmail(email: string, code: string, type: 'password-reset' | 'verification' = 'password-reset'): Promise<boolean> {
    try {
      console.log(`\n=== SIMULATED EMAIL ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${type === 'password-reset' ? 'Password Reset Code' : 'Email Verification Code'}`);
      console.log(`\nYour verification code is: ${code}`);
      console.log(`This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.`);
      console.log(`\nIf you didn't request this code, please ignore this email.`);
      console.log(`======================\n`);
      
      // Store the OTP locally for development
      await this.storeOTP(email, code);
      
      // In production, replace this with actual email API call
      // const response = await fetch(`${Config.API_BASE}/api/email/send-otp`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code, type })
      // });
      // return response.ok;
      
      return true; // Simulate successful email send
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false;
    }
  }

  /**
   * Request password reset OTP
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      if (!this.validateEmailFormat(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address.'
        };
      }

      const code = this.generateOTP();
      const emailSent = await this.sendOTPEmail(email, code, 'password-reset');
      
      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification code. Please try again.'
        };
      }

      return {
        success: true,
        message: 'Verification code sent to your email address.',
        code // For development only - remove in production
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Verify password reset code
   */
  static async verifyPasswordResetCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const isValid = await this.verifyOTP(email, code);
      
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid or expired verification code.'
        };
      }

      return {
        success: true,
        message: 'Verification code confirmed.'
      };
    } catch (error) {
      console.error('Error verifying password reset code:', error);
      return {
        success: false,
        message: 'An error occurred while verifying the code.'
      };
    }
  }

  /**
   * Complete password reset
   */
  static async completePasswordReset(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify the OTP is still valid and verified
      const isVerified = await this.isOTPVerified(email);
      if (!isVerified) {
        return {
          success: false,
          message: 'Verification code has expired or is invalid. Please request a new code.'
        };
      }

      // Additional validation
      if (newPassword.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long.'
        };
      }

      // Clear the OTP after successful reset
      await this.clearOTP();

      return {
        success: true,
        message: 'Password reset successfully.'
      };
    } catch (error) {
      console.error('Error completing password reset:', error);
      return {
        success: false,
        message: 'An error occurred while resetting your password.'
      };
    }
  }
}

export default EmailService;
