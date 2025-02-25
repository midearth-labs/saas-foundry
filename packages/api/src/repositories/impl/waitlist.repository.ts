import { eq, and } from 'drizzle-orm';
import { WaitListDefinitionRepository, WaitListEntryRepository } from '../interfaces/waitlist.repository';
import * as wl from '../../models/waitlist.model';

import { waitlistDefinitions, waitlistEntries } from '../../database/schema/waitlist.schema';
import { db } from '../../database/connection';
import { uuid } from 'drizzle-orm/pg-core';


export class DrizzleWaitListDefinitionRepository implements WaitListDefinitionRepository {
  async findAll(): Promise<wl.WaitListDefinitionDto[]> {
    return await db.select().from(waitlistDefinitions);
  }

  async findById(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionDto | null> {
    const definition = await db.select().from(waitlistDefinitions)
      .where(eq(
        waitlistDefinitions.id, data.id
      ));
    
    return definition[0] ?? null;
  }

  async findByIdAndStatus(data: wl.WaitListDefinitionIdDto, status: wl.WaitListStatus): Promise<wl.WaitListDefinitionDto | null> {
    const definition = await db.select().from(waitlistDefinitions)
      .where(and(
        eq(waitlistDefinitions.id, data.id),
        eq(waitlistDefinitions.status, status)
      ))
      .limit(1);
    return definition[0] ?? null;
  }

  async create(data: wl.CreateWaitListDefinitionDto): Promise<wl.WaitListDefinitionIdDto> {
    // TODO: Auto-populate:
    // - id: Use UUID generator, maybe uuidv4?
    // - createdAt: new Date()
    // - updatedAt: new Date()
    // Return the generated id
    const idDto: wl.WaitListDefinitionIdDto = { id: uuid().toString() }; // Drizzle + postgres uuid
    await db.insert(waitlistDefinitions).values({
      id: idDto.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return idDto;
  }
}

export class DrizzleWaitListEntryRepository implements WaitListEntryRepository {
  async create(data: wl.CreateWaitListEntryDto): Promise<wl.WaitListEntryIdDto> {
    // TODO: Auto-populate:
    // - id: Use UUID generator , maybe uuidv4?
    // - status: PENDING
    // - createdAt: new Date()
    // - updatedAt: new Date()
    // Return the generated id
    const idDto: wl.WaitListEntryIdDto = { id: uuid().toString() }
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
