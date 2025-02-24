import { todoRouter } from './todo.router';
import { RandomServiceRouter } from '../../api/schema/random.schema';

export const randomRouter: RandomServiceRouter = {
  getById2: todoRouter.getById,
};