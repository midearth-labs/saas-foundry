import * as dotenv from 'dotenv';
import path from 'path';
import { Email } from '../../../api/schema/common';
import { BaseEmailServiceInterface } from '../interfaces/base-email-service.interface';
import { VerificationEmailServiceInterface } from '../interfaces/verification-email-service.interface';
import { EmailResult, VerificationEmailOptions, VerificationData } from '../types/email-types';

// Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

/**
 * Implementation of the verification email service
 */
export class VerificationEmailServiceImpl implements VerificationEmailServiceInterface {
  private emailMarshal: BaseEmailServiceInterface;

  /**
   * Initialize with an email marshal
   * @param emailMarshal The underlying email marshalling service to use
   */
  constructor(emailMarshal: BaseEmailServiceInterface) {
    this.emailMarshal = emailMarshal;
  }

  /**
   * Send a verification email using BetterAuth's parameter structure
   * @param data The verification email data
   * @returns Promise with the result of the email sending operation
   */
  async sendVerificationEmailAdapter(data: VerificationData): Promise<void> {
    const transformedData = {
      email: data.user.email,
      token: data.token,
      url: data.url,
      subject: 'Verify your email',
      text: 'Click the link below to verify your email:'
    };
    await this.sendVerificationEmail(transformedData);
  }

  /**
   * Send a verification email
   * @param options The verification email options
   * @returns Promise with the result of the email sending operation
   */
  async sendVerificationEmail(options: VerificationEmailOptions): Promise<EmailResult> {
    const { email, token, url, subject = 'Verify your email', text } = options;

    // Construct the email content
    const html = `
      <p>Here is your verification token: ${token}</p>
      <p>${text || 'Click the link below to verify your email:'}</p>
      <p><a href="${url}">${url}</a></p>
    `;

    // Send the email using the underlying email service
    return await this.emailMarshal.sendEmail({
      from: Email.parse(process.env.EMAIL_FROM || 'noreply@example.com'),
      to: email,
      subject,
      html
    });
  }
} 