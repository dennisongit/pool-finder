import twilio from 'twilio';
import { env } from './env';

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    this.fromNumber = env.TWILIO_PHONE_NUMBER;
  }

  async sendVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<SMSResult> {
    try {
      const message = `Your Pool Finder verification code is: ${code}. This code expires in 10 minutes.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(phoneNumber)
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      };
    }
  }

  async sendWelcomeMessage(
    phoneNumber: string,
    firstName: string
  ): Promise<SMSResult> {
    try {
      const message = `Welcome to Pool Finder, ${firstName}! Your account is now active. Start discovering amazing pools near you.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(phoneNumber)
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error) {
      console.error('Welcome SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send welcome SMS'
      };
    }
  }

  async sendPasswordResetCode(
    phoneNumber: string,
    code: string
  ): Promise<SMSResult> {
    try {
      const message = `Your Pool Finder password reset code is: ${code}. This code expires in 10 minutes.`;
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(phoneNumber)
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error) {
      console.error('Password reset SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send password reset SMS'
      };
    }
  }

  async sendPoolNotification(
    phoneNumber: string,
    poolName: string,
    message: string
  ): Promise<SMSResult> {
    try {
      const fullMessage = `Pool Finder: ${poolName} - ${message}`;
      
      const result = await this.client.messages.create({
        body: fullMessage,
        from: this.fromNumber,
        to: this.formatPhoneNumber(phoneNumber)
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error) {
      console.error('Pool notification SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send pool notification SMS'
      };
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add +1 country code if not present (assuming US/Canada)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // Add + if not present
    if (!cleaned.startsWith('+') && cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    return cleaned.startsWith('+') ? phoneNumber : `+${cleaned}`;
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    // US/Canada phone numbers should be 10 digits (without country code)
    // International can be 10-15 digits
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  async getMessageStatus(messageId: string): Promise<string | null> {
    try {
      const message = await this.client.messages(messageId).fetch();
      return message.status;
    } catch (error) {
      console.error('Error fetching message status:', error);
      return null;
    }
  }
}

export const smsService = new SMSService();
