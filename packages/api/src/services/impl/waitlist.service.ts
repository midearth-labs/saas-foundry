import { WaitListDefinitionService, WaitListEntryService } from '../interfaces/waitlist.service';
import { WaitListDefinitionRepository, WaitListEntryRepository } from '../../repositories/interfaces/waitlist.repository';
import { TRPCError } from '@trpc/server';

export const waitListDefinitionService: WaitListDefinitionService = {
  async create({ input, ctx: { waitlistContext: { definitionRepository } } }) {
    const result = await definitionRepository.create(input);
    return { id: result.id };
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
  },
  async getStats({ input, ctx: { waitlistContext: { definitionRepository } } }) {
    const definition = await definitionRepository.findById(input);
    if (!definition) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'WaitListDefinition not found'
      });
    }
    return await definitionRepository.getStats(input);
  },
  async getActiveCount({ input, ctx: { waitlistContext: { definitionRepository } } }) {
    const definition = await definitionRepository.findById(input);
    if (!definition) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'WaitListDefinition not found'
      });
    }
    return await definitionRepository.getActiveCount(input);
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

    const result = await entryRepository.create(input);
    return { id: result.id };
  },
  
  // New dummy endpoint implementation for testing
  async createPaidEntry({ input, ctx }) {
    // Modified to work with both context types
    const repositories = ctx.repositories;
    const definitionRepository = repositories.waitlist.definition;
    const entryRepository = repositories.waitlist.entry;
    
    // Similar to create but with payment handling
    const isDefinitionRegistrationOpen = await definitionRepository.isDefinitionRegistrationOpen({id: input.definitionId});
    if (!isDefinitionRegistrationOpen) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Attached wait list identifier not found. It maybe archived or inactive'
      });
    }
    const basicEntryData = {
      definitionId: input.definitionId,
      email: input.email
    };

    const result = await entryRepository.create(basicEntryData);
    return { id: result.id };
  },
  
  async updateStatus({ input, ctx: { waitlistContext: { entryRepository } } }) {
    const entry = await entryRepository.findById({ id: input.entryId.id });
    if (!entry) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'WaitListEntry not found'
      });
    }
    const updatedEntry = await entryRepository.updateStatus({
      ...input,
      entryId: input.entryId
    });
    return {
      id: { id: updatedEntry.id },
      status: updatedEntry.status,
      updatedAt: updatedEntry.updatedAt,
    };
  },
  async getEntry({ input, ctx: { waitlistContext: { entryRepository } } }) {
    const entry = await entryRepository.findById({ id: input.id });
    if (!entry) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'WaitListEntry not found'
      });
    }
    return {
      ...entry,
      id: { id: entry.id }
    };
  },
  async searchEntries({ input, ctx: { waitlistContext: { definitionRepository, entryRepository } } }) {
    const definition = await definitionRepository.findById({ id: input.definitionId });
    if (!definition) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'WaitListDefinition not found'
      });
    }
    const result = await entryRepository.search(input);
    return {
      ...result,
      entries: result.entries.map(entry => ({
        ...entry,
        id: { id: entry.id }
      }))
    };
  }
};