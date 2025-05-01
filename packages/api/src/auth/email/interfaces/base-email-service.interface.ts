import { EmailOptions, EmailResult } from '../types/email-types';

/**
 * Base interface for all email services
 * Provides the foundational method for sending emails
 */
export interface BaseEmailServiceInterface {
  /**
   * Send an email with the provided options
   * @param options The email options
   * @returns Promise with the result of the email sending operation
   */
  sendEmail(options: EmailOptions): Promise<EmailResult>;
} 