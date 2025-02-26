import { eq, and } from 'drizzle-orm';
import { WaitListDefinitionRepository, WaitListEntryRepository } from '../interfaces/waitlist.repository';
import * as wl from '../../models/waitlist.model';

import { waitlistDefinitions, waitlistEntries } from '../../db/schema/waitlist.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const createDrizzleWaitListDefinitionRepository = (db: NodePgDatabase<any>): WaitListDefinitionRepository => {

  return {
    async findAll(): Promise<wl.WaitListDefinitionDto[]> {
      return await db.select().from(waitlistDefinitions);
    },

    async findById(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto | null> {
      const definition = await db.select().from(waitlistDefinitions)
        .where(eq(
          waitlistDefinitions.id, data.id
        ));
      
      return definition[0] ?? null;
    },

    async isDefinitionRegistrationOpen(data: wl.WaitListDefinitionIdDto): Promise<boolean> {
      const count = await db.$count(waitlistDefinitions, and(
        eq(waitlistDefinitions.id, data.id),
        eq(waitlistDefinitions.status, wl.WAITLIST_STATUSES.ACTIVE)
      ))
      
      return count > 0;
    },

    async create(data: wl.CreateWaitListDefinitionDto): Promise<wl.WaitListDefinitionIdDto> {
      const idDto: wl.WaitListDefinitionIdDto = { id: crypto.randomUUID() }; // Drizzle + postgres uuid
      console.log('idDto', idDto);
      await db.insert(waitlistDefinitions).values({
        ...data,
        id: idDto.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return idDto;
    }
  }
}

export const createDrizzleWaitListEntryRepository = (db: NodePgDatabase<any>): WaitListEntryRepository => {

  return {
    async create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto> {
      const idDto: wl.WaitListEntryIdDto = { id: crypto.randomUUID() }
      await db.insert(waitlistEntries).values({
        id: idDto.id,
        ...data,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return idDto;
    }
  }
}
