export interface IPlan {
    docId: string;
    name: string;
    price: number;
    hasUploadLimit: boolean;
    uploadLimit?: number;
    storageLimit: number;
    canSetExpirationDate: boolean;
    defaultExpirationDays?: number;
    canSetDownloadLimit: boolean;
    defaultDownloadLimit?: number;
  }