import { BaseClientInterface } from './base-client.interface';

/**
 * Interface for waitlist-related client operations
 */
export interface WaitlistClientInterface extends BaseClientInterface {
  /**
   * Create a waitlist definition
   * @param token Authentication token
   * @param name Waitlist name
   * @param description Waitlist description
   * @param status Waitlist status
   * @returns Promise with the created waitlist definition
   */
  createWaitlistDefinition(token: string, name: string, description: string, status: string): Promise<any>;
  
  /**
   * Create a waitlist entry
   * @param token Authentication token
   * @param definitionId Waitlist definition ID
   * @param email Email for the waitlist entry
   * @returns Promise with the created waitlist entry
   */
  createWaitlistEntry(token: string, definitionId: string, email: string): Promise<any>;
  
  /**
   * Update a waitlist entry status
   * @param token Authentication token
   * @param entryId Waitlist entry ID
   * @param status New status
   * @returns Promise with the updated waitlist entry
   */
  updateWaitlistEntryStatus(token: string, entryId: string, status: string): Promise<any>;
  
  /**
   * Search waitlist entries
   * @param token Authentication token
   * @param definitionId Waitlist definition ID
   * @param status Status to filter by
   * @param page Page number
   * @param limit Results per page
   * @returns Promise with the search results
   */
  searchWaitlistEntries?(token: string, definitionId: string, status: string, page: number, limit: number): Promise<any>;
} 