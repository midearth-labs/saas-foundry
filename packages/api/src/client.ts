import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppClientRouter } from './api/schema/root';

const client2 = createTRPCClient<AppClientRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3005/api/trpc',
      headers: () => ({
        'x-tenant-id': 'your-tenant-id-2'
      })
    })
  ]
});

async function main() {
  // Example usage
  const output1 = await client2.waitlist.definition.create.mutate({ name: 'Test', description: 'Test', status: 'ACTIVE' });
  const output2 = await client2.waitlist.entry.create.mutate({ definitionId: output1.id, email: 'test@test.com' });

  console.log(output1);
  console.log(output2);
}

main();