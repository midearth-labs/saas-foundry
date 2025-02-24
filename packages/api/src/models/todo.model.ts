export interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateTodoDto {
    title: string;
    description?: string;
  }
  
  export interface UpdateTodoDto {
    title?: string;
    description?: string;
    completed?: boolean;
  }