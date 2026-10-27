import type { RestricaoItemOutput, RestricoesPaginaOutput } from '@application/restricoes/dto';
import type { RestricoesUseCases } from '@application/restricoes/restricoesUseCases';

export function restricaoItemFixture(
  overrides: Partial<RestricaoItemOutput> = {},
): RestricaoItemOutput {
  return {
    id: 'RST-001',
    codigo: 'RST-001',
    tipo: 'mp',
    label: '🧪 Matéria-Prima',
    desc: 'Falta de IFA — Baricitinibe',
    det: 'Fornecedor Lilly com atraso na entrega · reabastecimento previsto 10/07',
    produto: 'Baricitinibe 2mg e 4mg · Linha 2',
    impacto: 'Bloqueio total',
    impCor: 'critica',
    prazo: '05/07/2026',
    resp: 'Ana Planejadora',
    sev: 'critica',
    sevLabel: 'Crítica',
    status: 'ativa',
    resolucaoResumo: '',
    form: {
      tipo: 'mp',
      sev: 'critica',
      desc: 'Falta de IFA — Baricitinibe',
      produto: 'Baricitinibe 2mg e 4mg · Linha 2',
      impacto: 'Bloqueio total',
      prazoIso: '2026-07-05',
      resp: 'Ana Planejadora',
      obs: 'Compra emergencial em avaliação. Produção suspensa até regularização.',
    },
    ...overrides,
  };
}

export function restricoesPaginaFixture(
  overrides: Partial<RestricoesPaginaOutput> = {},
): RestricoesPaginaOutput {
  return { itens: [restricaoItemFixture()], total: 8, pagina: 1, tamanho: 10, ...overrides };
}

export function createFakeRestricoesUseCases(
  overrides: Partial<RestricoesUseCases> = {},
): RestricoesUseCases {
  return {
    list: { execute: vi.fn().mockResolvedValue({ itens: [], total: 0, pagina: 1, tamanho: 10 }) },
    contar: { execute: vi.fn().mockResolvedValue({ ativas: 0, resolvidas: 0 }) },
    registrar: { execute: vi.fn().mockResolvedValue({ id: 'uuid-1', codigo: 'RST-023' }) },
    atualizar: { execute: vi.fn().mockResolvedValue(undefined) },
    resolver: { execute: vi.fn().mockResolvedValue(undefined) },
    resumo: { execute: vi.fn().mockResolvedValue({ ativas: 0, criticas: 0, porTipo: [] }) },
    ...overrides,
  };
}
