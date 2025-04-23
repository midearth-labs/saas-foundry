import { EmailResult, VerificationEmailOptions, VerificationData } from '../types/email-types';

/**
 * Interface for services that send verification emails
 */
export interface VerificationEmailServiceInterface {
  /**
   * Send a verification email with the provided options
   * @param options The verification email options
   * @returns Promise with the result of the email sending operation
   */
  sendVerificationEmail(options: VerificationEmailOptions): Promise<EmailResult>;

  /**
   * Send a verification email using BetterAuth's parameter structure
   * @param data The verification email data
   * @returns Promise with the result of the email sending operation
   */
  sendVerificationEmailAdapter(data: VerificationData): Promise<void>;
} 