export interface WaitlistEntry {
    id: string;
    definitionId: string;
    email: string;
    by?: string;
    status: WaitlistEntryStatus;
    metadata: JSON;
    fieldValues: JSON;
}
  
export interface CreateWaitlistEntryDto {
    definitionId: string;
    email: string;
    by?: string;
    status?: WaitlistEntryStatus;
    metadata: JSON;
    fieldValues: JSON;
}

export enum WaitlistEntryStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}
