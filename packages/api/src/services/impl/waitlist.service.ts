import { WaitListDefinitionService, WaitListEntryService } from '../interfaces/waitlist.service';
import { WaitListDefinitionRepository, WaitListEntryRepository } from '../../repositories/interfaces/waitlist.repository';
import { TRPCError } from '@trpc/server';

export const waitListDefinitionService: WaitListDefinitionService = {
  async create({ input, ctx: { waitlistContext: { definitionRepository } } }) {
    return await definitionRepository.create(input);
  },
  async list({ ctx: { waitlistContext: { definitionRepository } } }) {
    return await definitionRepository.findAll();
  },
  async get({ input, ctx: { waitlistContext: { definitionRepository } } }) {
    const definition = await definitionRepository.findById(input);
    if (!definition) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'WaitListDefinition not found'
      });
    }
    return definition;
  }
};

export const waitListEntryService: WaitListEntryService = {
  async create({ input, ctx: { waitlistContext: { definitionRepository, entryRepository } } }) {
    const isDefinitionRegistrationOpen = await definitionRepository.isDefinitionRegistrationOpen({id: input.definitionId});
    
    if (!isDefinitionRegistrationOpen) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Attached wait list identifier not found. It maybe archived or inactive'
      });
    }

    return await entryRepository.create(input);
  }
};