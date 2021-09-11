export interface IFile {
  active: boolean;
  docId: string;
  dateCreated: number;
  dateUpdated?: number;
  downloadLimit: number;
  downloadCount?: number;
  expirationDate: number;
  nickname?: string;
  password?: string;
  requirePassword: boolean;
  userId?: string;
}