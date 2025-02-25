import { TimestampsDto, StringIdDto } from "./common";

const WAITLIST_STATUS = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type WaitListStatus = typeof WAITLIST_STATUS[number];

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
