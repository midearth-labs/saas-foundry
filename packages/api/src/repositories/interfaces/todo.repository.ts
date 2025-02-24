import { Todo, CreateTodoDto, UpdateTodoDto } from '../../models/todo.model';

export interface TodoRepository {
  findAll(tenantId: string): Promise<Todo[]>;
  findById(id: number, tenantId: string): Promise<Todo | null>;
  create(data: CreateTodoDto, tenantId: string): Promise<Todo>;
  update(id: number, data: UpdateTodoDto, tenantId: string): Promise<Todo>;
  delete(id: number, tenantId: string): Promise<void>;
}