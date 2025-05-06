/**
 * Base interface for all client implementations
 * Defines common properties and methods used across different client types
 */
export interface BaseClientInterface {
  /**
   * Execute the main client flow
   * @returns Promise that resolves when the flow completes
   */
  execute(): Promise<any>;
} 