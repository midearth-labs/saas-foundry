import { TimestampsDto, StringIdDto } from "./common";

export enum WAITLIST_STATUSES { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE", ARCHIVED = "ARCHIVED" };
export type WaitListStatus = keyof typeof WAITLIST_STATUSES;

export enum WAITLIST_ENTRY_STATUSES { PENDING = "PENDING", APPROVED = "APPROVED", REJECTED = "REJECTED" };
export type WaitListEntryStatus = keyof typeof WAITLIST_ENTRY_STATUSES;

/**
 * Data transfer objects for waitlist definition operations
 */
export type CreateWaitListDefinitionDto = {
  name: string;
  description: string;
  status: WaitListStatus;
}

export type WaitListDefinitionIdDto = StringIdDto

export type WaitListDefinitionDto = WaitListDefinitionIdDto & CreateWaitListDefinitionDto & TimestampsDto

export type WaitListDefinitionStatsDto = {
  totalEntries: number;
  statusCounts: {
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
  lastEntryDate: Date | null;
  isActive: boolean;
}

export type WaitListDefinitionActiveCountDto = {
  pendingCount: number;
  isActive: boolean;
}

/**
 * Data transfer objects for waitlist entry operations
 */
export type CreateWaitListEntryDto = {
  definitionId: string;
  email: string;
}

export type WaitListEntryIdDto = StringIdDto

export type UpdateWaitListEntryStatusDto = {
  entryId: StringIdDto;
  status: WaitListEntryStatus;
}

export type WaitListEntryDto = WaitListEntryIdDto & {
  definitionId: string;
  email: string;
  status: WaitListEntryStatus;
} & TimestampsDto

export type SearchWaitListEntriesDto = {
  definitionId: string;
  status?: WaitListEntryStatus;
  email?: string;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

export type SearchWaitListEntriesResultDto = {
  entries: WaitListEntryDto[];
  total: number;
  page: number;
  pages: number;
}
