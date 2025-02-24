# Updated Project Structure

```
saas-foundry/
├── packages/
│   ├── trpc/                    # tRPC router definitions & schemas
│   │   ├── src/
│   │   │   ├── routers/        # Route handlers
│   │   │   ├── schemas/        # Zod schemas
│   │   │   └── types/          # Shared types
│   ├── api-server/             # Express + tRPC server
│   ├── jobs/                   # Background jobs
│   ├── shared/
│   │   ├── backend/           # Backend utilities
│   │   └── frontend/          # Frontend utilities
│   ├── ui/
│   │   ├── kits/             # UI components
│   │   ├── user-frontend/    # User dashboard (Next.js)
│   │   └── admin-frontend/   # Admin dashboard (Next.js)
│   └── cli/                   # CLI tools
└── apps/
    ├── website/               # Marketing site
    └── docs/                  # Documentation

## Core Package Dependencies

packages/trpc:
- @trpc/server
- zod
- superjson

packages/api-server:
- express
- @trpc/server
- cors
- helmet

shared/backend:
- prisma
- @prisma/client
- nodemailer
- stripe

shared/frontend:
- @trpc/client
- @trpc/react-query
- @tanstack/react-query
- superjson

## Development Setup

1. Configure Prisma:
```prisma
// packages/shared/backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Initial models here
```

2. tRPC Router Setup:
```typescript
// packages/trpc/src/router.ts
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

export const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
```

3. Express Server:
```typescript
// packages/api-server/src/index.ts
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '@saas-foundry/trpc';

const app = express();
app.use('/trpc', createExpressMiddleware({ router: appRouter }));
```