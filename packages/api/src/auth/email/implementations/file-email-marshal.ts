import * as fs from 'fs';
import * as path from 'path';
import { BaseEmailServiceInterface } from '../interfaces/base-email-service.interface';
import { EmailOptions, EmailResult } from '../types/email-types';

/**
 * Email marshalling service implementation that writes emails to files
 * Useful for development, testing, and debugging environments
 * Creates two files for each email:
 * - A JSON file with the raw email data
 * - An HTML file with a formatted view of the email
 */
export class FileEmailMarshal implements BaseEmailServiceInterface {
  private outputDir: string;

  /**
   * Initialize the File Email Marshal
   * @param outputDir Optional custom output directory (defaults to process.cwd())
   */
  constructor(outputDir?: string) {
    this.outputDir = outputDir || process.cwd();
    
    // Ensure the output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Send an email by writing it to files
   * @param options The email options
   * @returns Promise with a success result
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const timestamp = Date.now();
      const filePrefix = `email.${timestamp}`;
      
      // Create JSON format
      const jsonData = {
        timestamp: new Date().toISOString(),
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html || '',
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc
      };
      
      // Create HTML display format
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email: ${options.subject || 'No Subject'}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .email-container { border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
            .header { background-color: #f5f5f5; padding: 10px; margin-bottom: 20px; border-radius: 3px; }
            .content { margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; display: inline-block; width: 100px; }
            pre { white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h2>Email Details</h2>
              <div class="field"><span class="label">Timestamp:</span> ${new Date().toISOString()}</div>
              <div class="field"><span class="label">From:</span> ${options.from || 'Not specified'}</div>
              <div class="field"><span class="label">To:</span> ${Array.isArray(options.to) ? options.to.join(', ') : options.to || 'Not specified'}</div>
              ${options.cc ? `<div class="field"><span class="label">CC:</span> ${Array.isArray(options.cc) ? options.cc.join(', ') : options.cc}</div>` : ''}
              ${options.bcc ? `<div class="field"><span class="label">BCC:</span> ${Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc}</div>` : ''}
              ${options.replyTo ? `<div class="field"><span class="label">Reply To:</span> ${options.replyTo}</div>` : ''}
              <div class="field"><span class="label">Subject:</span> ${options.subject || 'No Subject'}</div>
            </div>
            
            <div class="content">
              ${options.html ? 
                `<h3>HTML Content:</h3>
                <div class="email-html-content">${options.html}</div>` : 
                ''}
              
              ${options.text ? 
                `<h3>Text Content:</h3>
                <pre>${options.text}</pre>` : 
                ''}
            </div>
          </div>
        </body>
        </html>
      `;

      // Write JSON file
      const jsonFilePath = path.join(this.outputDir, `${filePrefix}.json`);
      fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

      // Write HTML file
      const htmlFilePath = path.join(this.outputDir, `${filePrefix}.html`);
      fs.writeFileSync(htmlFilePath, htmlContent);

      console.info(`\n========== FILE EMAIL SERVICE ==========`);
      console.info(`Email written to: ${jsonFilePath}`);
      console.info(`Email HTML view: ${htmlFilePath}`);
      console.info(`==========================================\n`);
      
      return {
        success: true,
        message: `Files created: ${filePrefix}.json and ${filePrefix}.html`
      };
    } catch (error) {
      console.error('Failed to write email to files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 