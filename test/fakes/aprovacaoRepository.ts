import type { AprovacaoRepository } from '@domain/aprovacoes/AprovacaoRepository';
import { APROV_INGERIDOS_FIXTURE, APROVACOES } from '../fixtures/aprovacoes';

type Mocked<T> = { [K in keyof T]: ReturnType<typeof vi.fn> & T[K] };

export function createFakeAprovacaoRepository(): Mocked<AprovacaoRepository> {
  const ordenadas = [...APROVACOES].sort((a, b) => b.id.localeCompare(a.id));
  return {
    listPage: vi.fn(async (_filtro, { page, size }) => ({
      items: ordenadas.slice((page - 1) * size, page * size),
      total: ordenadas.length,
      page,
      limit: size,
    })),
    countPendentes: vi.fn(async () => 2),
    listEmUso: vi.fn(async () => [...APROV_INGERIDOS_FIXTURE]),
    update: vi.fn(async () => undefined),
  } as Mocked<AprovacaoRepository>;
}
