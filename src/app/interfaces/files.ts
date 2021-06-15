export interface IFiles {
	active: boolean;
	docId: string;
	dateCreated: number;
	dateUpdated?: number;
	downloadLimit: number;
	expirationDate: number;
  isAnonymous: boolean;
	password?: string;
  requirePassword: boolean;
}