export interface IFiles {
  active: boolean;
  docId: string;
  dateCreated: number;
  dateUpdated?: number;
  downloadLimit: number;
  downloadCount?: number;
  expirationDate: number;
  password?: string;
  requirePassword: boolean;
}