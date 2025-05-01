import { BaseEmailServiceInterface } from '../interfaces/base-email-service.interface';
import { EmailOptions, EmailResult } from '../types/email-types';

/**
 * Email marshalling service implementation that logs emails to the console
 * Useful for development and testing environments
 */
export class ConsoleEmailMarshal implements BaseEmailServiceInterface {
  /**
   * Send an email by logging it to the console
   * @param options The email options
   * @returns Promise with a success result
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    console.info('\n========== CONSOLE EMAIL SERVICE ==========');
    console.info(JSON.stringify(options, null, 2));
    if (options.text) {
      console.info('Text Content:', options.text);
    }
    console.info('==========================================\n');
    
    return {
      success: true,
      message: `console-email-${Date.now()}`
    };
  }
} 