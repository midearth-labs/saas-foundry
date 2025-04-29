/**
 * Utils module that re-exports all utilities from the original utils file
 * This allows implementations to import from a centralized location
 */
export {
  createUserOrThrow,
  signInUserOrThrow,
  signInUnsuccessfully,
  signInGoogleUserOrThrow,
  getTRPCClient,
  getTokenSilently,
  getUserInput,
  getAuthClient,
  createOrgOrThrow,
  getSessionTokenOrThrow,
  inviteUserToOrgOrThrow,
  acceptOrgInvitationOrThrow,
  getAllSessionsOrThrow,
  getActiveOrganization,
  setActiveOrganizationOrThrow
} from '../../utils';

// Re-export additional utils from auth
export {
  createOrg,
  addOrgMember,
  listOrgs
} from '../../../auth';

// Constants for random generation
export const rand = () => Math.floor(Math.random() * 9000 + 100);

/**
 * Utility to truncate error messages
 * @param error Error to truncate
 * @param maxLength Maximum length of the error message
 * @returns Truncated error message
 */
export const truncateError = (error: any, maxLength: number = 200): string => {
  const errorMessage = error?.message || String(error);
  return errorMessage.length > maxLength 
    ? `${errorMessage.substring(0, maxLength)}...` 
    : errorMessage;
}; 