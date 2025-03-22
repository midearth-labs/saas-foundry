import { AuthRoutesConfiguration, AuthServiceRouter } from '../../api/schema/auth';
import { authService } from '../../services/impl/auth.service';
import { authPublicProcedure } from '../base-procedures/auth';

export const authRouterConfiguration: AuthServiceRouter = {
  signUp: authPublicProcedure
    .input(AuthRoutesConfiguration.signUp.input)
    .mutation(authService.signUp),

  signIn: authPublicProcedure
    .input(AuthRoutesConfiguration.signIn.input)
    .mutation(authService.signIn),

  signOut: authPublicProcedure
    .input(AuthRoutesConfiguration.signOut.input)
    .mutation(authService.signOut),
}; 