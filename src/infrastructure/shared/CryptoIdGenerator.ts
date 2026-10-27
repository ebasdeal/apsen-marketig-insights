import type { IdGenerator } from '@domain/shared/IdGenerator';

export class CryptoIdGenerator implements IdGenerator {
  next(): string {
    return crypto.randomUUID();
  }
}
