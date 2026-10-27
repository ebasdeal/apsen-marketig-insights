import type { Restricao } from '@domain/restricoes/Restricao';
import type { RestricaoFiltro, RestricaoRepository } from '@domain/restricoes/RestricaoRepository';
import { RestricaoInvalidaError } from '@domain/restricoes/RestricaoInvalidaError';
import { formularioVazio } from '@domain/restricoes/restricaoRules';
import { AtualizarRestricao } from '../AtualizarRestricao';
import { ContarRestricoes } from '../ContarRestricoes';
import { ListRestricoes, statusDaAba } from '../ListRestricoes';
import { RegistrarRestricao } from '../RegistrarRestricao';
import { ResolverRestricao } from '../ResolverRestricao';
import { ResumirRestricoes } from '../ResumirRestricoes';

const ATIVA: Restricao = {
  id: 'RST-001',
  codigo: 'RST-001',
  tipo: 'mp',
  label: '🧪 Matéria-Prima',
  desc: 'Falta de IFA — Baricitinibe',
  det: 'Fornecedor com atraso',
  produto: 'Baricitinibe 2mg',
  impacto: 'Bloqueio total',
  impCor: 'critica',
  prazo: '05/07/2026',
  resp: 'Ana Planejadora',
  sev: 'critica',
  status: 'ativa',
  obs: 'Compra emergencial.',
  resolucao: null,
};

const CONTAGENS: Record<string, number> = {
  'status=ativa': 8,
  'status=resolvida': 14,
  'status=ativa&sev=critica': 3,
  'status=ativa&tipo=mp': 2,
  'status=ativa&tipo=demanda': 2,
};

function chave(filtro: RestricaoFiltro): string {
  return Object.entries(filtro)
    .map(([campo, valor]) => `${campo}=${String(valor)}`)
    .join('&');
}

function createFakeRepository(overrides: Partial<RestricaoRepository> = {}) {
  return {
    listPage: vi.fn(async (_filtro: RestricaoFiltro, pagina: number, tamanho: number) => ({
      items: [ATIVA],
      total: 8,
      page: pagina,
      limit: tamanho,
    })),
    count: vi.fn(async (filtro: RestricaoFiltro) => CONTAGENS[chave(filtro)] ?? 0),
    maiorCodigo: vi.fn(async () => 'RST-022'),
    create: vi.fn(async (restricao: Restricao) => restricao),
    update: vi.fn(async (id: string, patch: Partial<Restricao>) => ({ ...ATIVA, id, ...patch })),
    ...overrides,
  } satisfies RestricaoRepository;
}

describe('ListRestricoes', () => {
  it('pede a página da aba com 10 por página e devolve itens prontos para a tela', async () => {
    const repository = createFakeRepository();
    const pagina = await new ListRestricoes(repository).execute({ aba: 'ativas', pagina: 2 });
    expect(repository.listPage).toHaveBeenCalledWith({ status: 'ativa' }, 2, 10);
    expect(pagina).toMatchObject({ total: 8, pagina: 2, tamanho: 10 });
    expect(pagina.itens[0]).toMatchObject({
      id: 'RST-001',
      sevLabel: 'Crítica',
      resolucaoResumo: '',
      form: { tipo: 'mp', prazoIso: '2026-07-05', desc: ATIVA.desc },
    });
  });

  it('mapeia a aba para o status', () => {
    expect(statusDaAba('ativas')).toBe('ativa');
    expect(statusDaAba('resolvidas')).toBe('resolvida');
  });
});

describe('ContarRestricoes', () => {
  it('conta ativas e resolvidas em paralelo', async () => {
    const repository = createFakeRepository();
    await expect(new ContarRestricoes(repository).execute()).resolves.toEqual({
      ativas: 8,
      resolvidas: 14,
    });
    expect(repository.count).toHaveBeenCalledTimes(2);
  });
});

describe('ResumirRestricoes', () => {
  it('conta ativas, críticas e ativas por tipo para o dashboard', async () => {
    const repository = createFakeRepository();
    const resumo = await new ResumirRestricoes(repository).execute();
    expect(resumo.ativas).toBe(8);
    expect(resumo.criticas).toBe(3);
    expect(resumo.porTipo).toHaveLength(7);
    expect(resumo.porTipo[0]).toEqual({ tipo: 'mp', n: 2 });
    expect(resumo.porTipo.find((linha) => linha.tipo === 'outro')).toEqual({ tipo: 'outro', n: 0 });
    expect(repository.count).toHaveBeenCalledWith({ status: 'ativa', sev: 'critica' });
    expect(repository.count).toHaveBeenCalledWith({ status: 'ativa', tipo: 'logistica' });
  });
});

describe('RegistrarRestricao (RN-03)', () => {
  it('cria com o UUID de gerarId e o próximo código', async () => {
    const repository = createFakeRepository();
    const registrar = new RegistrarRestricao(repository, () => 'uuid-123');
    const result = await registrar.execute({
      ...formularioVazio(),
      tipo: 'capacidade',
      desc: 'Parada da Linha 4',
    });
    expect(result).toEqual({ id: 'uuid-123', codigo: 'RST-023' });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uuid-123', codigo: 'RST-023', status: 'ativa' }),
    );
  });

  it('valida antes de consultar o repositório', async () => {
    const repository = createFakeRepository();
    await expect(
      new RegistrarRestricao(repository, () => 'x').execute(formularioVazio()),
    ).rejects.toBeInstanceOf(RestricaoInvalidaError);
    expect(repository.maiorCodigo).not.toHaveBeenCalled();
  });
});

describe('AtualizarRestricao (RN-06)', () => {
  it('faz PATCH no mesmo id com as alterações da edição', async () => {
    const repository = createFakeRepository();
    await new AtualizarRestricao(repository).execute(ATIVA, {
      ...formularioVazio(),
      tipo: 'mp',
      desc: 'Nova descrição',
      prazoIso: '2026-07-30',
    });
    expect(repository.update).toHaveBeenCalledWith(
      'RST-001',
      expect.objectContaining({
        desc: 'Nova descrição',
        prazo: '30/07/2026',
        label: '🧪 Matéria-Prima',
      }),
    );
  });

  it('rejeita formulário inválido sem chamar o repositório', async () => {
    const repository = createFakeRepository();
    await expect(
      new AtualizarRestricao(repository).execute(ATIVA, { ...formularioVazio(), tipo: 'mp' }),
    ).rejects.toMatchObject({ campo: 'desc' });
    expect(repository.update).not.toHaveBeenCalled();
  });
});

describe('ResolverRestricao (RN-07)', () => {
  it('grava status resolvida e a data local de hoje', async () => {
    const repository = createFakeRepository();
    await new ResolverRestricao(repository, () => new Date(2026, 9, 27)).execute('RST-001');
    expect(repository.update).toHaveBeenCalledWith('RST-001', {
      status: 'resolvida',
      resolucao: 'Resolvida em 27/10/2026',
    });
  });
});
