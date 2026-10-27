import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type MockDb = Record<string, unknown> & { config: Record<string, unknown> };

let cache: MockDb | undefined;

export function readMockDb(): MockDb {
  cache ??= JSON.parse(
    readFileSync(resolve(__dirname, '../../mock-api/db.json'), 'utf-8'),
  ) as MockDb;
  return cache;
}

export function mockConfigOpcoes(): Record<string, unknown> {
  return readMockDb().config.opcoes as Record<string, unknown>;
}
