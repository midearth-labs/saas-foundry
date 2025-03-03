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
  // @TODO: @Awwal this should be added to test in your local branch, dont push to main
  const output3 = await client2.hotelGuest.create.mutate({ firstName: 'Test', lastName: 'Test', email: 'test@test.com', phone: '1234567890', status: 'CHECKED_IN' });

  console.log(output1);
  console.log(output2);
  console.log(output3);
}

main();