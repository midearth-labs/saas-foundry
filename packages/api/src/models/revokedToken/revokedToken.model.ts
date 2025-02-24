export interface RevokedToken {
    id: string;
    token: string;
    expiresAt: Date;
    revokedAt: Date;
  }
  
  export interface CreateRevokedTokenDto {
    token: string;
    expiresAt: Date;
  }
  
  export interface UpdateRevokedTokenDto {
    expiresAt?: Date;
  }