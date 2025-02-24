import { Todo, CreateTodoDto, UpdateTodoDto } from '../../models/todo/todo.model';

export interface TodoService {
  listTodos(tenantId: string): Promise<Todo[]>;
  getTodo(id: number, tenantId: string): Promise<Todo>;
  createTodo(data: CreateTodoDto, tenantId: string): Promise<Todo>;
  updateTodo(id: number, data: UpdateTodoDto, tenantId: string): Promise<Todo>;
  deleteTodo(id: number, tenantId: string): Promise<void>;
}