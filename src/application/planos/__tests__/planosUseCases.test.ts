import { PlanoInvalidoError, PlanoSemCicloError } from '@domain/planos/PlanoErrors';
import type { PlanoFiltro, PlanoItem, SkuMeta } from '@domain/planos/PlanoItem';
import type {
  CicloAtivoRepository,
  PlanoContagemFiltro,
  PlanoItemRepository,
  SkuMetaRepository,
} from '@domain/planos/PlanoItemRepository';
import { formularioDoItem, formularioInclusaoVazio } from '@domain/planos/planoRules';
import { NotFoundError } from '@domain/shared/DomainError';
import { AtualizarPlanoItem } from '../AtualizarPlanoItem';
import { ContarPlanoItens } from '../ContarPlanoItens';
import { ExcluirPlanoItem } from '../ExcluirPlanoItem';
import { GetPlanoItem } from '../GetPlanoItem';
import { IncluirPlanoItem } from '../IncluirPlanoItem';
import { ListPlanoItens } from '../ListPlanoItens';
import { ListSkusInclusao } from '../ListSkusInclusao';
import { ResumirPlano } from '../ResumirPlano';

const APROVADO: PlanoItem = {
  id: 'PLP-2026-07-001',
  codigo: 'PLP-2026-07-001',
  sku: 'SKU-00312',
  nome: 'Baricitinibe 2mg',
  apres: 'Blister 28cp',
  familia: 'Imunologia',
  qtd: 42500,
  linha: 'Linha 1',
  semana: 'S27 (30/06–06/07)',
  status: 'aprovado',
  resp: 'Ana Planejadora',
  obs: '',
};

const META: SkuMeta = {
  id: 'SKU-00058',
  nome: 'Apixabana 5mg',
  apres: 'Blister 60cp',
  familia: 'Cardio',
};

const FILTRO: PlanoFiltro = {
  busca: '',
  familia: '',
  status: '',
  ordem: null,
  pagina: 3,
  tamanho: 25,
};

const CONTAGENS: Record<string, number> = {
  aprovado: 107,
  revisao: 70,
  bloqueado: 35,
  pendente: 35,
};

function createItens(overrides: Partial<PlanoItemRepository> = {}) {
  return {
    listPage: vi.fn(async (filtro: PlanoFiltro) => ({
      items: [APROVADO],
      total: 247,
      page: filtro.pagina,
      limit: filtro.tamanho,
    })),
    count: vi.fn(async (filtro: PlanoContagemFiltro = {}) =>
      filtro.status === undefined ? 247 : (CONTAGENS[filtro.status] ?? 0),
    ),
    get: vi.fn(async () => APROVADO),
    maiorCodigo: vi.fn(async (prefixo?: string) =>
      prefixo === undefined ? 'PLP-2026-07-010' : `${prefixo}-247`,
    ),
    create: vi.fn(async (item: PlanoItem) => item),
    update: vi.fn(async (id: string, patch: Partial<PlanoItem>) => ({ ...APROVADO, id, ...patch })),
    delete: vi.fn(async () => undefined),
    ...overrides,
  } satisfies PlanoItemRepository;
}

function createSkuMeta(metas: SkuMeta[] = [META]) {
  return {
    listByIds: vi.fn(async (_ids: readonly string[]) => metas),
  } satisfies SkuMetaRepository;
}

function createCiclos(id: string | null = 'PLP-2026-07') {
  return { cicloAtivoId: vi.fn(async () => id) } satisfies CicloAtivoRepository;
}

describe('ListPlanoItens', () => {
  it('lista a página e o ciclo ativo em paralelo', async () => {
    const itens = createItens();
    const result = await new ListPlanoItens(itens, createCiclos()).execute(FILTRO);
    expect(itens.listPage).toHaveBeenCalledWith(FILTRO);
    expect(result).toMatchObject({ total: 247, pagina: 3, tamanho: 25, ciclo: 'PLP-2026-07' });
    expect(result.itens[0]).toMatchObject({
      skuCurto: '00312',
      statusLabel: 'Aprovado',
      editavel: false,
    });
  });

  it('sem ciclo ativo devolve ciclo null', async () => {
    const result = await new ListPlanoItens(createItens(), createCiclos(null)).execute(FILTRO);
    expect(result.ciclo).toBeNull();
  });
});

describe('ContarPlanoItens e ResumirPlano', () => {
  it('conta o total do plano', async () => {
    await expect(new ContarPlanoItens(createItens()).execute()).resolves.toBe(247);
  });

  it('resume total e contagem por status para o dashboard', async () => {
    const itens = createItens();
    await expect(new ResumirPlano(itens).execute()).resolves.toEqual({
      total: 247,
      porStatus: { aprovado: 107, revisao: 70, bloqueado: 35, pendente: 35 },
    });
    expect(itens.count).toHaveBeenCalledWith({ status: 'aprovado' });
  });
});

describe('GetPlanoItem', () => {
  it('devolve o detalhe em modo leitura para aprovado', async () => {
    const detalhe = await new GetPlanoItem(createItens()).execute('PLP-2026-07-001');
    expect(detalhe).toMatchObject({
      produtoLabel: 'Baricitinibe 2mg · Blister 28cp · SKU-00312',
      somenteLeitura: true,
      resp: 'Ana Planejadora',
      form: { qtd: '42500', status: 'aprovado' },
    });
  });

  it('propaga NotFoundError', async () => {
    const itens = createItens({
      get: async (id) => Promise.reject(new NotFoundError('Item do plano', id)),
    });
    await expect(new GetPlanoItem(itens).execute('x')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ListSkusInclusao', () => {
  it('monta as opções na ordem do protótipo e omite ids sem meta', async () => {
    const skuMeta = createSkuMeta([
      META,
      { id: 'SKU-00312', nome: 'Baricitinibe 2mg', apres: 'Blister 28cp', familia: 'Imunologia' },
    ]);
    const opcoes = await new ListSkusInclusao(skuMeta).execute();
    expect(skuMeta.listByIds.mock.calls[0]?.[0]).toHaveLength(10);
    expect(opcoes).toEqual([
      { value: 'SKU-00312', label: 'Baricitinibe 2mg — Blister 28cp · SKU-00312' },
      { value: 'SKU-00058', label: 'Apixabana 5mg — Blister 60cp · SKU-00058' },
    ]);
  });
});

describe('IncluirPlanoItem (RN-04, RN-05)', () => {
  const form = { ...formularioInclusaoVazio(), sku: 'SKU-00058', qtd: '50000' };

  it('cria pendente com UUID e o próximo código do ciclo ativo', async () => {
    const itens = createItens();
    const incluir = new IncluirPlanoItem(itens, createSkuMeta(), createCiclos(), () => 'uuid-9');
    await expect(incluir.execute(form)).resolves.toEqual({
      id: 'uuid-9',
      codigo: 'PLP-2026-07-248',
    });
    expect(itens.maiorCodigo).toHaveBeenCalledTimes(1);
    expect(itens.maiorCodigo).toHaveBeenCalledWith('PLP-2026-07');
    expect(itens.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uuid-9', status: 'pendente', nome: 'Apixabana 5mg' }),
    );
  });

  it('sem ciclo ativo usa o prefixo do maior código existente', async () => {
    const itens = createItens();
    const incluir = new IncluirPlanoItem(itens, createSkuMeta(), createCiclos(null), () => 'id');
    await expect(incluir.execute(form)).resolves.toMatchObject({ codigo: 'PLP-2026-07-248' });
    expect(itens.maiorCodigo).toHaveBeenNthCalledWith(1);
  });

  it('sem ciclo e sem itens lança PlanoSemCicloError', async () => {
    const itens = createItens({ maiorCodigo: async () => null });
    const incluir = new IncluirPlanoItem(itens, createSkuMeta(), createCiclos(null), () => 'id');
    await expect(incluir.execute(form)).rejects.toBeInstanceOf(PlanoSemCicloError);
  });

  it('valida antes de consultar e exige meta do SKU', async () => {
    const itens = createItens();
    const skuMeta = createSkuMeta([]);
    const incluir = new IncluirPlanoItem(itens, skuMeta, createCiclos(), () => 'id');
    await expect(incluir.execute(formularioInclusaoVazio())).rejects.toBeInstanceOf(
      PlanoInvalidoError,
    );
    expect(skuMeta.listByIds).not.toHaveBeenCalled();
    await expect(incluir.execute(form)).rejects.toEqual(new NotFoundError('SKU', 'SKU-00058'));
    expect(itens.create).not.toHaveBeenCalled();
  });
});

describe('AtualizarPlanoItem (RN-06)', () => {
  it('faz PATCH dos campos editáveis e devolve o código', async () => {
    const itens = createItens();
    const pendente = { ...APROVADO, status: 'pendente' as const };
    await expect(
      new AtualizarPlanoItem(itens).execute('PLP-2026-07-001', {
        ...formularioDoItem(pendente),
        qtd: '45000',
      }),
    ).resolves.toEqual({ codigo: 'PLP-2026-07-001' });
    expect(itens.update).toHaveBeenCalledWith('PLP-2026-07-001', {
      qtd: 45000,
      linha: 'Linha 1',
      semana: 'S27 (30/06–06/07)',
      status: 'pendente',
      resp: 'Ana Planejadora',
      obs: '',
    });
  });

  it('quantidade inválida não chama o repositório', async () => {
    const itens = createItens();
    await expect(
      new AtualizarPlanoItem(itens).execute('x', { ...formularioDoItem(APROVADO), qtd: '0' }),
    ).rejects.toMatchObject({ message: '⚠️ Informe a quantidade.', campo: 'qtd' });
    expect(itens.update).not.toHaveBeenCalled();
  });
});

describe('ExcluirPlanoItem', () => {
  it('remove pelo id', async () => {
    const itens = createItens();
    await new ExcluirPlanoItem(itens).execute('PLP-2026-07-005');
    expect(itens.delete).toHaveBeenCalledWith('PLP-2026-07-005');
  });
});
