# Standard Client Implementations

This directory contains refactored client implementations structured according to object-oriented design principles while maintaining the original promise chain (`.then()`) logic from the original implementations.

## Directory Structure

```
clients-standard/
├── common/         # Common utilities
├── interfaces/     # Client interfaces
├── implementations/# Client implementations
├── scripts/        # Scripts to run clients
└── client-factory.ts # Factory for creating clients
```

## Available Clients

- **EmailPasswordClient**: Standard email/password authentication
- **GoogleSocialClient**: Google social authentication
- **CreateOrganizationClient**: Organization creation with admin user
- **OrganizationInvitationClient**: Organization invitation flow
- **VerificationRequiredUserClient**: Create a user that requires verification

## How to Run

You can run the clients using the following npm scripts:

```bash
# Run any client by name
npm run client:standard -- <client-name>

# Run specific clients
npm run client:standard:email-password
npm run client:standard:google-social
npm run client:standard:create-organization
npm run client:standard:organization-invitation
npm run client:standard:verification-required-user
```

## Implementation Details

### Interfaces

The clients are organized around the following interfaces:

- **BaseClientInterface**: Common interface for all clients
- **AuthClientInterface**: Interface for authentication-related clients
- **OrganizationClientInterface**: Interface for organization-related clients
- **SocialAuthClientInterface**: Interface for social authentication-related clients
- **WaitlistClientInterface**: Interface for waitlist-related clients

### Client Factory

The `ClientFactory` class provides a centralized way to create client instances:

```typescript
// Get a client by name
const client = ClientFactory.getClient('email-password');

// Create a specific client
const emailClient = ClientFactory.createEmailPasswordClient();
```

### Promise Chain Structure

All implementations maintain the original `.then()` chain structure from the original implementations:

```typescript
return somePromise()
  .then(result => {
    // Do something with result
    return nextPromise();
  })
  .then(nextResult => {
    // Continue the chain
  })
  .catch(error => {
    // Handle errors
  });
```

## Notes

- The implementations are designed to be functionally equivalent to the original client implementations.
- All implementations maintain the original promise chain (`.then()`) structure.
- The original client implementations in the `client/` directory are preserved and unmodified. 