import { waitlistPublicProcedure } from '../../base-procedures/waitlist';
import { EntryServiceRouter, EntryRoutesConfiguration } from '../../../api/schema/waitlist/entry.schema';

export const entryRouter: EntryServiceRouter = {
  create: waitlistPublicProcedure
    .input(EntryRoutesConfiguration['create']['input'])
    .mutation(({ ctx, input }) => {
      ctx.logger.info(input);
      return { id: ctx.extendedRequestId }
    }),
};
