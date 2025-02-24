import { eq, and } from 'drizzle-orm';
import { TodoRepository } from '../interfaces/todo.repository';
import { Todo, CreateTodoDto, UpdateTodoDto } from '../../models/todo/todo.model';
import { todos } from '../../database/schema/todo.schema';
import { db } from '../../database/connection';

export class DrizzleTodoRepository implements TodoRepository {
  async findAll(tenantId: string): Promise<Todo[]> {
    return await db.select().from(todos)
      .where(eq(todos.tenantId, tenantId));
  }

  async findById(id: number, tenantId: string): Promise<Todo | null> {
    const results = await db.select().from(todos)
      .where(and(
        eq(todos.id, id),
        eq(todos.tenantId, tenantId)
      ))
      .limit(1);
    
    return results[0] || null;
  }

  async create(data: CreateTodoDto, tenantId: string): Promise<Todo> {
    const result = await db.insert(todos)
      .values({
        ...data,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return result[0];
  }

  async update(id: number, data: UpdateTodoDto, tenantId: string): Promise<Todo> {
    const result = await db.update(todos)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(
        eq(todos.id, id),
        eq(todos.tenantId, tenantId)
      ))
      .returning();
    
    return result[0];
  }

  async delete(id: number, tenantId: string): Promise<void> {
    await db.delete(todos)
      .where(and(
        eq(todos.id, id),
        eq(todos.tenantId, tenantId)
      ));
  }
}