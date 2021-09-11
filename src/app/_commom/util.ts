import { AngularFireStorage } from "@angular/fire/storage";

/**
 * Função para verificar se um valor está Nulo ou Indefinido
 *
 * @param value Valor a ser validado
 */
export function isNullOrEmpty(value: string): boolean {
  return value === null || value === undefined || value.length === 0;
}

export function humanFileSize(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let i = 0;
  while (bytes >= 1024) {
    bytes /= 1024;
    ++i;
  }

  return Math.floor(bytes * 100) / 100 + ' ' + units[i];
}