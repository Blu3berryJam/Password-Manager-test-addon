export interface StoredCredential {
  id: string;
  website: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface AutofillConfig {
  enabled: boolean;
  autoFill: boolean;
}