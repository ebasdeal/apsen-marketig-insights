import type { Aprovacao } from '@domain/aprovacoes/Aprovacao';
import { toAprovacao } from '@infrastructure/aprovacoes/aprovacaoMapper';
import {
  aprovacoesResponseSchema,
  type AprovacaoApiDto,
} from '@infrastructure/aprovacoes/aprovacaoSchema';
import { readMockDb } from './mockDb';

const db = readMockDb();

export const APROVACOES_API: AprovacaoApiDto[] = aprovacoesResponseSchema.parse(db.aprovacoes);

export const APROVACOES: Aprovacao[] = APROVACOES_API.map(toAprovacao);

export const APROV_INGERIDOS_FIXTURE = db.config.APROV_INGERIDOS as string[];

export function aprovacaoFixture(id: string): Aprovacao {
  const item = APROVACOES.find((candidato) => candidato.id === id);
  if (item === undefined) {
    throw new Error(`aprovação ${id} ausente no db.json`);
  }
  return structuredClone(item);
}
