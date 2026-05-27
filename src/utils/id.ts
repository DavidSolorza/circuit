import { v4 as uuid } from 'uuid';

export function genId(prefix: string): string {
  return `${prefix}_${uuid().slice(0, 8)}`;
}
