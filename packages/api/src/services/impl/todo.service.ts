import { TodoService } from '../interfaces/todo.service';
import { TodoRepository } from '../../repositories/interfaces/todo.repository';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../../models/todo.model';
import { TRPCError } from '@trpc/server';

export class DefaultTodoService implements TodoService {
  constructor(private todoRepository: TodoRepository) {}

  async listTodos(tenantId: string): Promise<Todo[]> {
    return await this.todoRepository.findAll(tenantId);
  }

  async getTodo(id: number, tenantId: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id, tenantId);
    if (!todo) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Todo not found'
      });
    }
    return todo;
  }

  async createTodo(data: CreateTodoDto, tenantId: string): Promise<Todo> {
    return await this.todoRepository.create(data, tenantId);
  }

  async updateTodo(id: number, data: UpdateTodoDto, tenantId: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id, tenantId);
    if (!todo) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Todo not found'
      });
    }
    return await this.todoRepository.update(id, data, tenantId);
  }

  async deleteTodo(id: number, tenantId: string): Promise<void> {
    const todo = await this.todoRepository.findById(id, tenantId);
    if (!todo) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Todo not found'
      });
    }
    await this.todoRepository.delete(id, tenantId);
  }
}