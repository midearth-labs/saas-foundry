export interface User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
  }
  
  export interface CreateUserDto {
    email: string;
    password: string;
    role?: UserRole;
  }
  
  export interface UpdateUserDto {
    email?: string;
    password?: string;
    role?: UserRole;
  }

  export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
  }
  