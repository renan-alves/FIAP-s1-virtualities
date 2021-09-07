export type IUser = IUserBase & {
  name: string;
  email: string;
  password: string;
}

export type IUserAnonymous = IUserBase & {
  fingerprint: string;
}

export type IUserProvider = IUserBase & {
  name: string;
  email: string;
  photoUrl?: string;
  provider: string;
}

type IUserBase = {
  uid: string;
  planId?: string;
  uploads?: number;
  storage?: number;
  isAnonymous: boolean;
  dateCreated: number;
  dateUpdated?: number; 
}