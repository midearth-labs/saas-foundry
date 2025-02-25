import { waitlistAdminProcedure } from '../../base-procedures/waitlist';
import { DefinitionServiceRouter, DefinitionRoutesConfiguration } from '../../../api/schema/waitlist/definition.schema';

export const definitionRouter: DefinitionServiceRouter = {
  list: waitlistAdminProcedure
    .input(DefinitionRoutesConfiguration['list']['input'])
    .query(() => {
      return [{ id: 'abcde', name: 'Test', description: 'Test', status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() }]
    }),

  get: waitlistAdminProcedure
    .input(DefinitionRoutesConfiguration['get']['input'])
    .query(({ input }) => {
      return { id: input.id, name: 'Test', description: 'Test', status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() }
    }),

  create: waitlistAdminProcedure
    .input(DefinitionRoutesConfiguration['create']['input'])
    .mutation(({ ctx, input }) => {
      ctx.logger.info(input);
      return { id: ctx.extendedRequestId }
    }),
};
