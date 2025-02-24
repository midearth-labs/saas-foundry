import { router } from './trpc';
import { todoRouter } from './routers/todo.router';
import { randomRouter } from './routers/random.router';
import { AppServiceRouter } from '../api/schema/root';

export const appRouter = router({
  todo: todoRouter,
  ...randomRouter,
} satisfies AppServiceRouter);

export type AppRouter = typeof appRouter;