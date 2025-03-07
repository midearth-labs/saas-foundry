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

## Prompt Results

See commit [`8bc88092`](https://github.com/midearth-labs/saas-foundry/commit/8bc88092d2bbe1ee063a81c264febf60f2ad3892#diff-df955bcf8861116b2fe60d84ab137b66e8a715d0b0d7192966446e336e56497e)