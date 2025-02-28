# Prompting Format for Cursor after declaring MDCs

There are currently two main approaches to declaring and configuring MDCs:

1. High-level approach: .cursorrules folder with all .mdc files
2. Low-level approach: .mdc files are declared in the relevant folders where specific instructions are required

## ⚠ UPDATE
**This YouTuber explains a better approach to MDCs (including use-cases involving monorepos) in this video: https://www.youtube.com/watch?v=A9BiNPf34Z4 **

This version currently implemented the low-level approach with current results being subpar (the generated blog example is currently not included due to the quality of the results). The high-level approach is scheduled to be implemented in quick succession in the next commit.

However, to test-drive the low-level approach, the following prompt format can be used in accordance with the current mdc files:

```
This is a monorepo project but we are **ONLY** working on the api package located in root/packages/api. Hence, nothing outside should be modified without explicit request for approval and my confirmation. In the api packages, the tech stack is TypeScript, Zod, tRPC, Fastify, Drizzle, Postgres, pino. Please take note: whenever a command or prompt is issued by asking you to create something in the directory "api/<some_dir>", please **be informed that this means the api subpackage located in root/packages/api because this is a monorepo and we are ONLY and PRECISELY involved with that package alone**.

/create Add a blog feature to the API (root/packages/api; aliased as @saas-foundry/api in he high level turbo.json/package.json) on top of already existing APIs, with the following requirements:
- Blog posts should have title, content, author, status (draft/published), and timestamps
- Support CRUD operations
- Include proper validation
- Follow the service-repository pattern
- Implement proper error handling

/create First, let's create the blog schema and types in api/schema/blog.schema.ts.

/create Create the blog repository interface in api/repositories/interfaces/blog.repository.ts

/create Implement the blog repository in api/repositories/impl/blog.repository.ts

/create Implement the blog service in api/services/impl/blog.service.ts

/create Create the blog router in api/trpc/routers/blog.router.ts

/edit Update api/trpc/root.ts to include the blog router

Feel free to first propose other things you feel is necessary by the time you inspect my already existing code base.


```

