// SMS Service for sending notifications to members
// Using Twilio or similar SMS provider

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface SMSMessage {
  to: string;
  body: string;
  type: 'announcement' | 'reminder' | 'alert';
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  phone: string;
}

// Mock SMS service for development
// In production, replace with actual Twilio or other SMS provider
export class SMSService {
  private config: SMSConfig;

  constructor(config?: SMSConfig) {
    this.config = config || {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
    };
  }

  /**
   * Send SMS to a single phone number
   */
  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    try {
      // Validate phone number
      if (!message.to || !this.isValidPhoneNumber(message.to)) {
        return {
          success: false,
          error: 'Invalid phone number',
          phone: message.to,
        };
      }

      // Validate message
      if (!message.body || message.body.trim().length === 0) {
        return {
          success: false,
          error: 'Message body is empty',
          phone: message.to,
        };
      }

      // In production, use actual SMS provider
      if (process.env.NODE_ENV === 'production' && this.config.accountSid) {
        return await this.sendViaTwilio(message);
      }

      // Development: Log to console and simulate success
      console.log(`[SMS] To: ${message.to}`);
      console.log(`[SMS] Type: ${message.type}`);
      console.log(`[SMS] Message: ${message.body}`);
      console.log(`[SMS] ✓ SMS would be sent in production`);

      return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        phone: message.to,
      };
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        phone: message.to,
      };
    }
  }

  /**
   * Send SMS to multiple phone numbers
   */
  async sendBulkSMS(
    phoneNumbers: string[],
    body: string,
    type: 'announcement' | 'reminder' | 'alert' = 'announcement'
  ): Promise<SMSResult[]> {
    const results: SMSResult[] = [];

    for (const phone of phoneNumbers) {
      const result = await this.sendSMS({
        to: phone,
        body,
        type,
      });
      results.push(result);

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Accept various phone formats
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Send via Twilio (production)
   */
  private async sendViaTwilio(message: SMSMessage): Promise<SMSResult> {
    try {
      // Use Twilio SDK to send SMS
      const accountSid = this.config.accountSid;
      const authToken = this.config.authToken;
      const fromNumber = this.config.fromNumber;

      // Create basic auth header for Twilio API
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('From', fromNumber);
      formData.append('To', message.to);
      formData.append('Body', message.body);

      // Send request to Twilio API
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[TWILIO] Error:', error);
        return {
          success: false,
          error: error.message || 'Twilio API error',
          phone: message.to,
        };
      }

      const result = await response.json();
      console.log(`[TWILIO] SMS sent successfully to ${message.to}. SID: ${result.sid}`);

      return {
        success: true,
        messageId: result.sid,
        phone: message.to,
      };
    } catch (error) {
      console.error('[TWILIO] Send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Twilio error',
        phone: message.to,
      };
    }
  }

  /**
   * Format announcement for SMS
   */
  static formatAnnouncementSMS(title: string, body: string, maxLength: number = 160): string {
    const prefix = '📢 Gibi Gubaie: ';
    const message = `${title}\n${body}`;
    const maxBodyLength = maxLength - prefix.length;

    if (message.length <= maxBodyLength) {
      return prefix + message;
    }

    return prefix + message.substring(0, maxBodyLength - 3) + '...';
  }

  /**
   * Format reminder for SMS
   */
  static formatReminderSMS(title: string, time: string): string {
    return `⏰ Reminder: ${title} at ${time}`;
  }

  /**
   * Format alert for SMS
   */
  static formatAlertSMS(title: string, message: string): string {
    return `⚠️ Alert: ${title}\n${message}`;
  }
}

// Export singleton instance
export const smsService = new SMSService();
