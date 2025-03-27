import { randomBytes, randomUUID } from 'crypto';
import { 
  createUserOrThrow, 
  signInUserOrThrow,
  signInUnsuccessfully,
  getTRPCClient
} from './auth-trpc-utils';


const
  USER_NAME = "Oladipo Fasoro",
  USER_EMAIL = "dfasoro@gmail.com",
  USER_PASSWORD = "TheBestPassWordInTheUniverseNot"

async function main() {

  const { createdUser } = await createUserOrThrow(
    USER_NAME, 
    USER_EMAIL, 
    USER_PASSWORD
  );

  const { signedInUser } = await signInUserOrThrow(
    USER_EMAIL, 
    USER_PASSWORD
  );

  const { unsuccessfulUser } = await signInUnsuccessfully(
    USER_EMAIL, 
    USER_PASSWORD + "BAD"
  );

  const authenticatedTRPCClient = getTRPCClient(signedInUser.data!.token);
  const unauthenticatedTRPCClient = getTRPCClient(unsuccessfulUser?.data?.token ?? "");

  let authOutput = await authenticatedTRPCClient
    .waitlist
    .definition
    .create
    .mutate({ name: 'Test', description: 'Desc', status: 'ACTIVE' });

  let unauthOutput = await unauthenticatedTRPCClient
    .waitlist
    .definition
    .create
    .mutate({ name: 'Test2', description: 'Desc2', status: 'ACTIVE' });
  
  console.log("\nWaitlist procedures currently work with unauthenticated requests");
  console.log({authOutput, unauthOutput});

  console.log("\nBookstore book creation procedures MUST be authenticated");
  authOutput = await authenticatedTRPCClient
    .bookstore
    .book
    .create
    .mutate({
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        status: 'AVAILABLE',
        isbn: '978-0262033848',
        price: 110.00
    });
  console.log({authOutput});

  try { unauthOutput = await unauthenticatedTRPCClient
    .bookstore
    .book
    .create
    .mutate({
        title: 'Principia Naturalis Philosophiae',
        author: 'Isaac Newton',
        status: 'AVAILABLE',
        isbn: '978-0198526775',
        price: 100.00
    });
  console.log({unauthOutput});
  } catch (error) {
    console.error("unauthOutput: This request correctly failed as it is unauthenticated:\n",
        JSON.stringify(error, null, 2).slice(0, 150) + "[...truncated...]"
    );
  }

  console.log("\nCreating one more book for good measure");
  authOutput = await authenticatedTRPCClient
    .bookstore
    .book
    .create
    .mutate({
        title: 'The Art of Computer Programming',
        author: 'Donald E. Knuth',
        status: 'AVAILABLE',
        isbn: '978-0201896834',
        price: 120.00
    });
  console.log({authOutput});

  console.log("\nListing all books");
  const books = await authenticatedTRPCClient
    .bookstore
    .book
    .list
    .query();
  console.log({books});

  console.log("\nGetting a single book by ISBN");
  const book = await authenticatedTRPCClient
    .bookstore
    .book
    .get
    .query({ id: books[0].id });
  console.log({book});

  console.log("\nUpdating a book");
  const updatedBook = await authenticatedTRPCClient
    .bookstore
    .book
    .update
    .mutate({ id: books[0].id, data: { title: 'The Art of Computer Programming (Updated)' } });
  console.log({updatedBook});

  console.log("\nDeleting a book");
  const deletedBook = await authenticatedTRPCClient
    .bookstore
    .book
    .remove
    .mutate({ id: books[0].id });
  console.log({deletedBook});
}

main();