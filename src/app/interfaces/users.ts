export type IUser = IUserBase & {
  name: string;
  email: string;
  password: string;
}

export type IUserAnonymous = IUserBase & {
  fingerprint: string;
}

type IUserBase = {
  uid: string;
  planId?: string;
  uploads?: number;
  storage?: number;
  isAnonymous: boolean;
}