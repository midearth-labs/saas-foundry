import { WaitListDefinitionService, WaitListEntryService } from '../interfaces/waitlist.service';
import { WaitListDefinitionRepository, WaitListEntryRepository } from '../../repositories/interfaces/waitlist.repository';
import * as wl from '../../models/waitlist.model';
import { TRPCError } from '@trpc/server';

export class DefaultWaitListDefinitionService implements WaitListDefinitionService {
  constructor(private waitListDefinitionRepository: WaitListDefinitionRepository) {}

  async create(data: wl.CreateWaitListDefinitionDto): Promise<wl.WaitListDefinitionIdDto> {
    return this.waitListDefinitionRepository.create(data);
  }

  async list(): Promise<wl.WaitListDefinitionDto[]> {
    return this.waitListDefinitionRepository.findAll();
  }

  async get(id: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto> {
    const definition = await this.waitListDefinitionRepository.findById(id);
    if (!definition) {
      throw new Error('WaitListDefinition not found');
    }
    return definition;
  }
}

export class DefaultWaitListEntryService implements WaitListEntryService {
  constructor(private waitListEntryRepository: WaitListEntryRepository, private waitListDefinitionRepository: Pick<WaitListDefinitionRepository, 'findByIdAndStatus'>) {}

  async create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto> {
    const definition = await this.waitListDefinitionRepository.findByIdAndStatus({id: data.definitionId}, wl.WAITLIST_STATUSES.ACTIVE);
    if (!definition) {
      throw new Error('Attached wait list identifier not found. It maybe archived or inactive');
    }
    return this.waitListEntryRepository.create(data);
  }
}
