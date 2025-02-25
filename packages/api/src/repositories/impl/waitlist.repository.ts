import { eq, and } from 'drizzle-orm';
import { WaitListDefinitionRepository, WaitListEntryRepository } from '../interfaces/waitlist.repository';
import * as wl from '../../models/waitlist.model';

import { waitlistDefinitions, waitlistEntries } from '../../database/schema/waitlist.schema';
import { db } from '../../database/connection';

/**
 * TODO: Awwal to implement the WaitListDefinitionRepository interface
 * Use the examples from the TodoExample in the previous commit
 */
export class DrizzleWaitListDefinitionRepository implements WaitListDefinitionRepository {
  async findAll(): Promise<wl.WaitListDefinitionDto[]> {
    throw new Error('Method not implemented: findAll');
  }

  async findById(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto | null> {
    throw new Error('Method not implemented: findById');
  }

  async findByIdAndStatus(data: wl.WaitListDefinitionIdDto, status: wl.WaitListStatus): Promise<wl.WaitListDefinitionDto | null> {
    throw new Error('Method not implemented: findByIdAndStatus');
  }

  async create(data: wl.CreateWaitListDefinitionDto): Promise<wl.WaitListDefinitionIdDto> {
    // TODO: Auto-populate:
    // - id: Use UUID generator
    // - createdAt: new Date()
    // - updatedAt: new Date()
    throw new Error('Method not implemented: create');
  }
}

/**
 * TODO: Awwal to implement the WaitListEntryRepository interface
 */
export class DrizzleWaitListEntryRepository implements WaitListEntryRepository {
  async create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto> {
    // TODO: Auto-populate:
    // - id: Use UUID generator 
    // - status: PENDING
    // - createdAt: new Date()
    // - updatedAt: new Date()
    throw new Error('Method not implemented: create');
  }
}
