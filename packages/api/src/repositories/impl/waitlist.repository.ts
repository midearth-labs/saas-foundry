import { eq, and, sql } from 'drizzle-orm';
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
    },

    async getStats(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionStatsDto> {
      const entries = await db.select().from(waitlistEntries)
        .where(eq(waitlistEntries.definitionId, data.id));

      const definition = await this.findById(data);

      return {
        totalEntries: entries.length,
        statusCounts: {
          PENDING: entries.filter(e => e.status === 'PENDING').length,
          APPROVED: entries.filter(e => e.status === 'APPROVED').length,
          REJECTED: entries.filter(e => e.status === 'REJECTED').length
        },
        lastEntryDate: entries.length > 0 ? entries[entries.length - 1].createdAt : null,
        isActive: definition?.status === wl.WAITLIST_STATUSES.ACTIVE
      };
    },

    async getActiveCount(data: wl.WaitListDefinitionIdDto): Promise<wl.WaitListDefinitionActiveCountDto> {
      const entries = await db.select().from(waitlistEntries)
        .where(and(
          eq(waitlistEntries.definitionId, data.id),
          eq(waitlistEntries.status, 'PENDING')
        ));

      const definition = await this.findById(data);
      
      return {
        pendingCount: entries.length,
        isActive: definition?.status === wl.WAITLIST_STATUSES.ACTIVE
      };
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
    },

    async findById(data: wl.WaitListEntryIdDto): Promise<wl.WaitListEntryDto | null> {
      const entry = await db.select().from(waitlistEntries)
        .where(eq(waitlistEntries.id, data.id));
      return entry[0] ?? null;
    },

    async updateStatus(data: wl.UpdateWaitListEntryStatusDto): Promise<wl.WaitListEntryDto> {
      await db.update(waitlistEntries)
        .set({ 
          status: data.status, 
          updatedAt: new Date() 
        })
        .where(eq(waitlistEntries.id, data.entryId.id));
      
      const entry = await this.findById({ id: data.entryId.id });
      if (!entry) throw new Error('Entry not found after update');
      return entry;
    },

    async search(data: wl.SearchWaitListEntriesDto): Promise<wl.SearchWaitListEntriesResultDto> {
      const conditions = [eq(waitlistEntries.definitionId, data.definitionId)];
      
      if (data.status) {
        conditions.push(eq(waitlistEntries.status, data.status));
      }
      if (data.email) {
        conditions.push(eq(waitlistEntries.email, data.email));
      }
      if (data.fromDate) {
        conditions.push(sql`${waitlistEntries.createdAt} >= ${data.fromDate}`);
      }
      if (data.toDate) {
        conditions.push(sql`${waitlistEntries.createdAt} <= ${data.toDate}`);
      }

      const offset = (data.page - 1) * data.limit;
      const entries = await db.select()
        .from(waitlistEntries)
        .where(and(...conditions))
        .limit(data.limit)
        .offset(offset);

      const [{ count }] = await db.select({ 
        count: sql<number>`count(*)` 
      })
      .from(waitlistEntries)
      .where(and(...conditions));

      return {
        entries,
        total: Number(count),
        page: data.page,
        pages: Math.ceil(Number(count) / data.limit)
      };
    }
  }
}
