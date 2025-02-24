import { router } from './trpc';
import { todoRouter } from './routers/todo.router';
import { randomRouter } from './routers/random.router';
import { AppServiceRouter } from '../api/schema/root';

const routerConfiguration: AppServiceRouter = {
  todo: todoRouter,
  ...randomRouter,
}

export const appRouter = router(routerConfiguration);