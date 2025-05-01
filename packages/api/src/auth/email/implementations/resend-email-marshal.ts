import * as dotenv from 'dotenv';
import path from 'path';
import { Resend } from 'resend';
import { BaseEmailServiceInterface } from '../interfaces/base-email-service.interface';
import { EmailOptions, EmailResult } from '../types/email-types';

// Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

/**
 * Email marshalling service implementation that uses the {@link https://resend.com/docs/api-reference/emails/send-email Resend API}
 * For production use to send real emails
 */
export class ResendEmailMarshal implements BaseEmailServiceInterface {
  private resend: Resend;

  /**
   * Initialize the Resend client
   */
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    this.resend = new Resend(apiKey);
  }

  /**
   * Send an email using the Resend API
   * @param options The email options
   * @returns Promise with the result of the email sending operation
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    let result;
    try {
      result = await this.resend.emails.send(options);

      return {
        success: true,
        // messageId: result.id
      };
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: JSON.stringify(result, null, 2)
      };
    }
  }
} 