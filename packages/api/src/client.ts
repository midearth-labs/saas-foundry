import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from './trpc/root';
import type { AppClientRouter as AppRouter2 } from './api/schema/root';

const client1 = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3005/api/trpc',
      headers: () => ({
        'x-tenant-id': 'your-tenant-id-1'
      })
    })
  ]
});

const client2 = createTRPCClient<AppRouter2>({
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
  const todos1 = await client1.todo.list.query();
  const output1 = await client1.getById2.query(128);
  const todos2 = await client2.todo.create.mutate({ title: 'Testty', description: 'Test 2' });
  const output2 = await client2.getById2.query(129);

  console.log(todos1);
  console.log(todos2);
  console.log(output1);
  console.log(output2);
}

main();