import { IUsers } from "./users";

export interface IFiles {
  active: boolean;
  docId: string;
  customers?: IUsersFiles[];
  dateCreated: number;
  dateUpdated?: number;
  downloadLimit: number;
  downloadCount?: number;
  expirationDate: number;
  isAnonymous: boolean;
  password?: string;
  requirePassword: boolean;
}

export interface IUsersFiles extends IUsers {
  downloadDate: number;
  customers?: IUsers[];
}