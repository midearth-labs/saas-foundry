import { TRPCError } from '@trpc/server';
import { AuthService } from '../interfaces/auth.service';

export const authService: AuthService = {
  async signUp({ input, ctx: { logger, repositories } }) {
    // BetterAuth signup implementation will go here
    logger.info('Processing signup request', { email: input.email });
    const result = await repositories.auth.signUp(input);
    console.log(JSON.stringify(result, null, 2));
    return result;
  },

  async signIn({ input, ctx: { logger, repositories } }) {
    logger.info('Processing signin request', { email: input.email });
    // BetterAuth signin implementation will go here
    return await repositories.auth.signIn(input);
  },

  async signOut({ ctx: { logger, repositories } }) {
    logger.info('Processing signout request');
    // BetterAuth signout implementation will go here
    return await repositories.auth.signOut();
  }
}; 