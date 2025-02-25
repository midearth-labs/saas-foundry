import { TimestampsDto, StringIdDto } from "./common";

export enum WAITLIST_STATUSES { ACTIVE = "ACTIVE", INACTIVE = "INACTIVE", ARCHIVED = "ARCHIVED" };
export type WaitListStatus = keyof typeof WAITLIST_STATUSES;

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

/**
 * Data transfer objects for waitlist entry operations
 */
export type CreateWaitListEntryDto = {
  definitionId: string;
  email: string;
}

export type WaitListEntryIdDto = StringIdDto
