import * as dotenv from 'dotenv';
import path from 'path';
import { BaseEmailServiceInterface } from '../interfaces/base-email-service.interface';
import { VerificationEmailServiceInterface } from '../interfaces/verification-email-service.interface';
import { OrganizationInvitationEmailServiceInterface } from '../interfaces/organization-invitation-email-service.interface';
import { ConsoleEmailMarshal as ConsoleEmailMarshall } from '../implementations/console-email-marshal';
import { ResendEmailMarshal as ResendEmailMarshal } from '../implementations/resend-email-marshal';
import { FileEmailMarshal } from '../implementations/file-email-marshal';
import { VerificationEmailServiceImpl } from '../implementations/verification-email-service.impl';
import { OrganizationInvitationEmailServiceImpl } from '../implementations/organization-invitation-email-service.impl';

// Load environment variables
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

/**
 * Factory for creating email service instances.
 * It automatically assigns an email provider (marshalling service) based on `env` configurations.
 */
export class EmailServiceFactory {
  /**
   * Create a base email service based on environment configuration
   * @returns A base email **marshalling** service
   */
  private static createBaseEmailMarshall(): BaseEmailServiceInterface {
    const emailProvider = process.env.EMAIL_PROVIDER || 'console';
    
    switch (emailProvider.toLowerCase()) {
      case 'resend':
        return new ResendEmailMarshal();
      case 'file':
        const outputDir = path.join(process.cwd(), 'email-output');
        return new FileEmailMarshal(outputDir);
      case 'console':
      default:
        return new ConsoleEmailMarshall();
    }
  }
  
  /**
   * Create a verification email service
   * @returns A verification email service
   */
  public static createVerificationEmailService(): VerificationEmailServiceInterface {
    return new VerificationEmailServiceImpl(this.createBaseEmailMarshall());
  }
  
  /**
   * Create an organization invitation email service
   * @returns An organization invitation email service
   */
  public static createOrganizationInvitationEmailService(): OrganizationInvitationEmailServiceInterface {
    return new OrganizationInvitationEmailServiceImpl(this.createBaseEmailMarshall());
  }
} 