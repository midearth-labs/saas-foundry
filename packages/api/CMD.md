## Install dependencies

Add initial (almost empty) package.json from turborepo instructions

```bash
pnpm add @trpc/server@next @trpc/client@next drizzle-orm@latest pg@latest pino@latest zod@latest @fastify/cors@latest fastify@latest
```


Add and investigate (maybe to remove) the following dependencies:

```bash
pnpm add pino-pretty@latest
```

When ready for JWT implementation, add the following dependencies:

```bash
pnpm add jsonwebtoken@latest @fastify/jwt@latest @node-rs/argon2@latest
pnpm add @types/jsonwebtoken@latest @types/fastify-jwt@latest @types/node-rs__argon2@latest -D
```

## Install dev dependencies
```bash
pnpm add zod-to-json-schema@latest typescript@latest tsx@latest drizzle-kit@latest @types/pg@latest @types/node@latest -D
pnpm add eslint@latest tsup@latest ts-node@latest -D
```

Add vitest later setup

```bash
pnpm add vitest@latest @vitest/coverage-v8@latest -D
```

Add to dev dependencies

```
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
```

## Initialize TypeScript
```bash
npx tsc --init
```

## Run migrations
```bash
pnpm run migrate
```

## Run the application
```bash
pnpm run dev
```