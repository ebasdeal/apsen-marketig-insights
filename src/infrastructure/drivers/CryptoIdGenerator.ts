import type { IdGenerator } from '@domain/drivers/IdGenerator';

export class CryptoIdGenerator implements IdGenerator {
  next(): string {
    return globalThis.crypto.randomUUID();
  }
}
