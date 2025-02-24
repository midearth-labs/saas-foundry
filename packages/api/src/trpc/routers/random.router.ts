import { todoRouter } from './todo.router';
import { RandomServiceRouter } from '../../api/schema/random.schema';

export const randomRouter = {
  getById2: todoRouter.getById,
} satisfies RandomServiceRouter;

type TodoRouter = typeof todoRouter;