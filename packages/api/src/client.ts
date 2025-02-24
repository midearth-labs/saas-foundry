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
  const todos2 = await client2.todo.create.mutate({ title: 'Testty', description: 'Test 2' });
  const output2 = await client2.getById2.query(129);

  console.log(todos2);
  console.log(output2);
}

main();