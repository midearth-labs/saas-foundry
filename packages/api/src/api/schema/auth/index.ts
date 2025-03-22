import { z } from 'zod';
import { ConvertRoutesToType, ZodOperation, ZodRoutes } from '../../types/schema.zod.configuration';
import { ConvertRoutesToCreateRouterOptions } from '../../types/schema.configuration';
import { Email, VoidInputSchema, VoidOutputSchema } from '../common';

const authUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: Email,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUp = {
  input: authUserSchema,
  output: VoidOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

const signIn = {
  input: z.object({
    email: Email,
    password: z.string().min(1, "Password is required"),
  }),
  output: VoidOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

const signOut = {
  input: VoidInputSchema,
  output: VoidOutputSchema,
  type: 'mutation',
} satisfies ZodOperation;

export const AuthRoutesConfiguration = {
  signUp,
  signIn,
  signOut,
} satisfies ZodRoutes;

export type AuthServiceShape = ConvertRoutesToType<typeof AuthRoutesConfiguration>;
export type AuthServiceRouter = ConvertRoutesToCreateRouterOptions<AuthServiceShape>; 