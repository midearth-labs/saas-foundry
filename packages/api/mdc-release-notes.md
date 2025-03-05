# Release Notes for Experimental Features

## Prompting strategies for Cursor after declaring MDCs

There are currently two main approaches to declaring and configuring MDCs:

1. High-level approach: ROOT-LEVEL [`.cursor/rules`](../../.cursor/rules) folder with all .mdc files
2. Low-level approach: .mdc files are declared in the relevant folders where specific instructions are required

## ⚠ UPDATE
* The High-Level approach is currently being used as there is currently no official support
  for the Low-Level approach (doesn't get detected in Cursor Settings and Project Rules sub-settings).

* Current high-level MDC files are captured in Cursor's settings as seen below:

  ![image](https://github.com/user-attachments/assets/c416c4fb-8157-46c3-a356-0d9cda69c5f9)

* **This YouTuber explains a better approach to MDCs (including use-cases involving monorepos) in this video: https://www.youtube.com/watch?v=A9BiNPf34Z4**


## Prompting Format for Cursor after declaring MDCs

``` 
This is a monorepo project but we are **ONLY** working on the api package located in root/packages/api. 
Hence, nothing outside should be modified without explicit request for approval and my confirmation. 
In the api packages, the tech stack is TypeScript, Zod, tRPC, Fastify, Drizzle, Postgres, pino. 
Please take note: whenever a command or prompt is issued by asking you to create something in 
the directory "api/<some_dir>", please **be informed that this means the api subpackage located in root/packages/api 
because this is a monorepo and we are ONLY and PRECISELY involved with that package alone**.
    
I want to implement a new `bookstore` feature in the API package (packages/api/). 
Following the controller-service-repository pattern, I'll need guidance on creating all necessary components. 
I need you to preciesly abide (100% NECESSARY) by the following MDC rules:

- API Package Database Model Specifications (api-package-db-model-rules.mdc)
- API Package Database Schema Specifications (api-package-db-schema-rules.mdc)
- API Package API Schema Specifications (api-package-api-schema-rules.mdc)
- API Package Base Level Specifications (api-package-general-rules.mdc)
- API Package Repository Pattern Specifications (api-package-repository-rules.mdc)
- API Package Service Specifications (api-package-service-rules.mdc)
- API Package tRPC Configuration Specifications (api-package-trpc-rules.mdc)
- API Package Type Configurations Specifications (api-package-type-config-rules.mdc)

Other extremely important rules that you must not forget or gloss over:
- When declaring API schemas in packages/api/src/api/schema, ALWAYS export service router types. Recheck the API Package API Schema Specifications (api-package-api-schema-rules.mdc) again to be sure as this is totally mandatory.

- The AppRoutesConfiguration declaration in the root schema file (packages/api/src/api/schema/root.ts) MUST contain high level inclusion of all routes belonging to a new API feature, nested under one key-value entry. Also, router configurations MUST be typed whenever they are being generated. Recheck the API Package tRPC Configuration Specifications (api-package-trpc-rules.mdc) again to be sure as this is totally mandatory.

- When declaring Zod validation schemas, ALWAYS consider opprtunities to "not repeat yourself": check packages/api/src/db/schema/common.ts and see if commonly defined schemas already exist (e.g. required emails).

- Context creation MUST NEVER be directly implemented in interfaces for services (packages/api/src/services/interfaces) for each API feature implemented, they should instead be declared in base procedures (packages/api/src/trpc/base-procedures/{new-feature}.ts). Recheck the API Package Service Specifications (api-package-service-rules.mdc) again to be sure as this is totally mandatory.

Take your time to carefully evaluate the imports to ensure you are correcly addressing references, 
so that you don't hallucinate and reference non-existent entities.
```

### Results can be seen in commit [`70d84f`](https://github.com/midearth-labs/saas-foundry/commit/70d84f6c4d9ee1fa91c300050a134c5d307f00c6)

## Cursor's Response When Asked for Explanation of Generated Code

I'll explain all the components created for the hotel-guests feature, following the controller-service-repository pattern:
1. Models (DTOs) - [hotel-guest.model.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/models/hotel-guest.model.ts)
    ```
    - HOTEL_GUEST_STATUS enum: Defines possible guest states (CHECKED_IN, CHECKED_OUT, etc.)
    - CreateHotelGuestDto: Base DTO for creating guests with required and optional fields
    - HotelGuestIdDto: Extends StringIdDto for ID handling
    - HotelGuestDto: Complete DTO combining ID, base fields, and timestamps
    ```
2. Database Schema - [hotel-guest.schema.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/db/schema/hotel-guest.schema.ts)
    ```
    - hotelGuestStatusEnum: Postgres enum for guest statuses
    - hotelGuestTable: Drizzle table definition with:
    - Primary key (UUID)
    - Required fields (firstName, lastName, email, phone, status)
    - Optional fields (roomNumber, checkInDate, checkOutDate, specialRequests)
    - Timestamps (createdAt, updatedAt)
    ```
3. Repository Layer<br>
    a. Interface - [hotel-guest.repository.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/repositories/interfaces/hotel-guest.repository.ts)
    ```
    - Defines CRUD operations contract:
    - create(): Creates new guest
    - findById(): Retrieves guest by ID
    - findAll(): Lists all guests
    - update(): Updates guest data
    - delete(): Removes guest
    ```
    b. Implementation - [hotel-guest.repository.impl.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/repositories/impl/hotel-guest.repository.ts)
    ```
    - Implements repository interface using Drizzle
    - Handles date conversions between DB and DTO formats
    - Uses mapToDto helper for consistent data transformation
    ```
4. Service Layer<br>
    a. Interface - [hotel-guest.service.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/services/interfaces/hotel-guest.service.ts)
    ```
    - Defines HotelGuestContext type with repository dependency
    - Declares service methods matching schema shapes
    ```
    b. Implementation - [hotel-guest.service.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/services/impl/hotel-guest.service.ts)
    ```
    - Implements business logic
    - Handles error cases (e.g., NOT_FOUND)
    - Delegates data operations to repository
    ```
5. Schema Validation - [hotel-guest.schema.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/db/schema/hotel-guest.schema.ts)
    ```
    - Zod schemas for input/output validation
    - Defines routes configuration:
    - create: Creates new guest
    - get: Retrieves single guest
    - list: Gets all guests
    - update: Modifies guest data
    - delete: Removes guest
    - Exports service shape types
    ```
6. tRPC Router - [hotel-guest.router.ts](https://github.com/midearth-labs/saas-foundry/blob/experimental/mdc-guidance/packages/api/src/trpc/routers/hotel-guest.router.ts)
    ```
    - Sets up base procedure with repository context
    - Defines API endpoints:
    - create (mutation)
    - get (query)
    - list (query)
    - update (mutation)
    - delete (mutation)
    - Links schemas, service, and procedures
    ```
7. Repository Registration<br>
    a. Type Definition - [repositories.ts](api/src/trpc/repositories.ts)
    ```
    - Extends Repositories interface with hotelGuest
    - Maintains type safety for repository access
    ```
    b. Implementation - [repositories.impl.ts](api/src/trpc/repositories.impl.ts)
    ```
    - Registers hotelGuest repository in createRepositories
    - Integrates with existing repository setup
    ```

The implementation follows these key principles:
- Type safety throughout the stack
- Clear separation of concerns
- Consistent error handling
- Data validation at boundaries
- Repository pattern for data access
- Service layer for business logic
- Clean API design with tRPC