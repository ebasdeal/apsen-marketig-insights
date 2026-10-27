import type { Ingerido } from '@domain/ingeridos/Ingerido';
import { toIngerido } from '@infrastructure/ingeridos/ingeridoMapper';
import {
  ingeridosResponseSchema,
  type IngeridoApiDto,
} from '@infrastructure/ingeridos/ingeridoSchema';
import { readMockDb } from './mockDb';

export const INGERIDOS_API: IngeridoApiDto[] = ingeridosResponseSchema.parse(
  readMockDb().ingeridos,
);

export const INGERIDOS: Ingerido[] = INGERIDOS_API.map(toIngerido);
