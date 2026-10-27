import type {
  PlanoItemDetailOutput,
  PlanoItemRowOutput,
  PlanoListOutput,
} from '@application/planos/dto';
import type { PlanosUseCases } from '@application/planos/planosUseCases';
import type { PlanoFiltro } from '@domain/planos/PlanoItem';

export const PLANO_FILTRO_PADRAO: PlanoFiltro = {
  busca: '',
  familia: '',
  status: '',
  ordem: null,
  pagina: 1,
  tamanho: 10,
};

export function planoItemRowFixture(
  overrides: Partial<PlanoItemRowOutput> = {},
): PlanoItemRowOutput {
  return {
    id: 'PLP-2026-07-001',
    codigo: 'PLP-2026-07-001',
    sku: 'SKU-00312',
    skuCurto: '00312',
    nome: 'Baricitinibe 2mg',
    apres: 'Blister 28cp',
    familia: 'Imunologia',
    qtd: 42500,
    linha: 'Linha 1',
    semana: 'S27 (30/06–06/07)',
    status: 'aprovado',
    statusLabel: 'Aprovado',
    editavel: false,
    ...overrides,
  };
}

export function planoItemDetailFixture(
  overrides: Partial<PlanoItemDetailOutput> = {},
): PlanoItemDetailOutput {
  return {
    ...planoItemRowFixture({
      id: 'PLP-2026-07-005',
      codigo: 'PLP-2026-07-005',
      status: 'pendente',
      statusLabel: 'Pendente',
      editavel: true,
    }),
    resp: 'Ana Planejadora',
    obs: '',
    produtoLabel: 'Baricitinibe 2mg · Blister 28cp · SKU-00312',
    somenteLeitura: false,
    form: {
      qtd: '42500',
      linha: 'Linha 1',
      semana: 'S27 (30/06–06/07)',
      status: 'pendente',
      resp: 'Ana Planejadora',
      obs: '',
    },
    ...overrides,
  };
}

export function planoListFixture(overrides: Partial<PlanoListOutput> = {}): PlanoListOutput {
  return {
    itens: [planoItemRowFixture()],
    total: 247,
    pagina: 1,
    tamanho: 10,
    ciclo: 'PLP-2026-07',
    ...overrides,
  };
}

export function createFakePlanosUseCases(overrides: Partial<PlanosUseCases> = {}): PlanosUseCases {
  return {
    list: {
      execute: vi
        .fn()
        .mockResolvedValue({ itens: [], total: 0, pagina: 1, tamanho: 10, ciclo: null }),
    },
    contar: { execute: vi.fn().mockResolvedValue(0) },
    get: { execute: vi.fn().mockResolvedValue(planoItemDetailFixture()) },
    skusInclusao: { execute: vi.fn().mockResolvedValue([]) },
    incluir: {
      execute: vi.fn().mockResolvedValue({ id: 'uuid-1', codigo: 'PLP-2026-07-248' }),
    },
    atualizar: { execute: vi.fn().mockResolvedValue({ codigo: 'PLP-2026-07-005' }) },
    excluir: { execute: vi.fn().mockResolvedValue(undefined) },
    resumo: {
      execute: vi.fn().mockResolvedValue({
        total: 0,
        porStatus: { aprovado: 0, revisao: 0, bloqueado: 0, pendente: 0 },
      }),
    },
    ...overrides,
  };
}
