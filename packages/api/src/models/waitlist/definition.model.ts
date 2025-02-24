export interface WaitListDefinition {
    id: string;
    name: string;
    description: string;
    waitlistType: string;
    status: WaitlistStatus;
    fields: JSON; // Could later be reworked to Record<WaitlistFieldType, string>;
    createdAt: Date;
    updatedAt: Date;
}
  
export interface CreateWaitlistDefinitionDto {
    name: string;
    description: string;
    waitlistType: string;
    status: WaitlistStatus;
    fields: JSON;
}
  
export interface UpdateWaitlistDefinitionDto {
    name?: string;
    description?: string;
    waitlistType?: string;
    status?: WaitlistStatus;
    fields?: JSON;
}

export enum WaitlistStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED'
}

export enum WaitlistFieldType {
    TEXT = 'TEXT',
    SELECT = 'SELECT',
    MULTISELECT = 'MULTISELECT',
    EMAIL = 'EMAIL',
    REASON = 'REASON',
    COMPANY_NAME = 'COMPANY_NAME'
}
  