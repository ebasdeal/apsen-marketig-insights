import type { Analise } from '@domain/analises/Analise';
import type {
  AnaliseApoioRepository,
  CicloFonte,
  DriverAprovadoFonte,
} from '@domain/analises/AnaliseApoioRepository';
import { AnaliseInvalidaError } from '@domain/analises/AnaliseInvalidaError';
import type { AnaliseRepository } from '@domain/analises/AnaliseRepository';
import {
  buildAnalise,
  buildNovaAnaliseForm,
  REGRAS_CHAT,
  RESULTADO_MOCK,
} from '@test/fixtures/analises';
import { ContarAnalises } from '../ContarAnalises';
import { DocumentarInteracao } from '../DocumentarInteracao';
import { ExecutarAnalise } from '../ExecutarAnalise';
import { ExportarPdfAnalise } from '../ExportarPdfAnalise';
import { comStatus, GetAnalise } from '../GetAnalise';
import { GetNovaAnaliseOpcoes } from '../GetNovaAnaliseOpcoes';
import { GetResumoAnalises } from '../GetResumoAnalises';
import { ListAnalises } from '../ListAnalises';
import { ListDriversSugeridos } from '../ListDriversSugeridos';
import { ListSkusDoCiclo } from '../ListSkusDoCiclo';
import { ResponderChat } from '../ResponderChat';
import { SalvarAnalise } from '../SalvarAnalise';

function fakeRepository(atual: Analise = buildAnalise()) {
  return {
    listPage: vi.fn().mockResolvedValue({ items: [atual], total: 11, page: 2, limit: 10 }),
    count: vi.fn().mockResolvedValue(2),
    get: vi.fn().mockResolvedValue(atual),
    maiorCodigo: vi.fn().mockResolvedValue('ANL-002'),
    create: vi.fn().mockImplementation(async (analise: Analise) => analise),
    update: vi.fn().mockImplementation(async (_id: string, patch: Partial<Analise>) => ({
      ...atual,
      ...patch,
    })),
  } satisfies AnaliseRepository;
}

function fakeApoio() {
  return {
    skusDoCiclo: vi.fn().mockResolvedValue([
      { codigo: 'SKU-00312', nome: 'Baricitinibe 2mg', familia: 'Imunologia', dias: 18 },
      { codigo: 'SKU-00058', nome: 'Apixabana 5mg', familia: 'Cardio', dias: 45 },
      { codigo: 'SKU-00313', nome: 'Baricitinibe 4mg', familia: 'Imunologia', dias: 0 },
    ]),
    modelosGuiados: vi
      .fn()
      .mockResolvedValue([
        { id: 'sarimax', nome: 'SARIMAX', icon: '📊', desc: 'd', tag: 'Recomendado' },
      ]),
    configuracao: vi.fn().mockResolvedValue({ resultado: RESULTADO_MOCK, regrasChat: REGRAS_CHAT }),
  } satisfies AnaliseApoioRepository;
}

const agora = () => new Date(2026, 9, 27, 14, 5);

describe('ListAnalises (CA-01 / CA-02 / CA-03 / RN-01)', () => {
  it('pagina no servidor com 10 por página e devolve cards', async () => {
    const repository = fakeRepository();
    const output = await new ListAnalises(repository).execute({
      busca: '  bari ',
      status: 'salva',
      pagina: 2,
    });
    expect(repository.listPage).toHaveBeenCalledWith({
      busca: 'bari',
      status: 'salva',
      pagina: 2,
      tamanho: 10,
    });
    expect(output).toEqual({
      itens: [
        {
          id: 'ANL-001',
          titulo: 'Impacto campanha TV Inverno — Baricitinibe',
          status: 'salva',
          statusLabel: '✅ Salva',
          ciclo: 'PLP-2026-07',
          skusCount: 2,
          modelo: 'SARIMAX',
          criada: '20/06/2026',
        },
      ],
      total: 11,
      pagina: 2,
      tamanho: 10,
    });
  });

  it('página inválida vira 1', async () => {
    const repository = fakeRepository();
    await new ListAnalises(repository).execute({ busca: '', status: '', pagina: 0 });
    await new ListAnalises(repository).execute({ busca: '', status: '', pagina: Number.NaN });
    expect(repository.listPage.mock.calls.map(([filtro]) => filtro.pagina)).toEqual([1, 1]);
  });
});

describe('ContarAnalises e GetResumoAnalises (RN-13 / dashboard)', () => {
  it('conta todas ou por status', async () => {
    const repository = fakeRepository();
    await expect(new ContarAnalises(repository).execute()).resolves.toBe(2);
    await new ContarAnalises(repository).execute({ status: 'salva' });
    expect(repository.count.mock.calls).toEqual([[], [{ status: 'salva' }]]);
  });

  it('resumo: total e salvas = salva + relatório', async () => {
    const repository = fakeRepository();
    repository.count.mockImplementation(async (filtro?: { status?: string }) =>
      filtro?.status === 'salva' ? 1 : filtro?.status === 'relatorio' ? 3 : 7,
    );
    await expect(new GetResumoAnalises(repository).execute()).resolves.toEqual({
      total: 7,
      salvas: 4,
    });
  });
});

describe('GetAnalise (CA-09 / CA-10 / CA-11)', () => {
  it('monta o detalhe pronto para a tela', async () => {
    const analise = buildAnalise({
      historicoIa: [{ pergunta: 'Por que?', resposta: 'Porque.', ts: null }],
    });
    const detail = await new GetAnalise(fakeRepository(analise)).execute('ANL-001');
    expect(detail).toMatchObject({
      id: 'ANL-001',
      statusLabel: '✅ Salva',
      metaSkus: '2 SKU(s)',
      podeExportarPdf: true,
      sumarioSegmentos: [
        { texto: 'Impacto de ', forte: false },
        { texto: '+18%', forte: true },
        { texto: '.', forte: false },
      ],
      historico: [{ pergunta: 'Por que?', resposta: 'Porque.', ts: null }],
      mensagensChat: [
        { papel: 'usuario', texto: 'Por que?' },
        { papel: 'ia', texto: 'Porque.' },
      ],
    });
    expect(detail.impactos.map(({ largura, sinal }) => [largura, sinal])).toEqual([
      [70, '+'],
      [30, '+'],
      [25, ''],
    ]);
    expect(detail.comparacao.linhas).toHaveLength(12);
  });

  it('rascunho não pode exportar; comStatus atualiza status, rótulo e PDF', async () => {
    const detail = await new GetAnalise(
      fakeRepository(buildAnalise({ status: 'rascunho' })),
    ).execute('ANL-001');
    expect(detail.podeExportarPdf).toBe(false);
    expect(comStatus(detail, 'salva')).toMatchObject({
      status: 'salva',
      statusLabel: '✅ Salva',
      podeExportarPdf: true,
    });
  });
});

describe('GetNovaAnaliseOpcoes (CA-04 / RN-02)', () => {
  it('rotula os ciclos marcando o ativo e traz os modelos guiados', async () => {
    const ciclos: CicloFonte = {
      listCiclos: vi.fn().mockResolvedValue([
        { id: 'PLP-2026-07', descricao: 'Planejamento Julho 2026', status: 'ativo' },
        { id: 'PLP-2026-06', descricao: 'Planejamento Junho 2026', status: 'encerrado' },
      ]),
    };
    const output = await new GetNovaAnaliseOpcoes(ciclos, fakeApoio()).execute();
    expect(output.ciclos).toEqual([
      { value: 'PLP-2026-07', label: 'PLP-2026-07 · Julho 2026 (ativo)' },
      { value: 'PLP-2026-06', label: 'PLP-2026-06 · Junho 2026' },
    ]);
    expect(output.cicloAtivoId).toBe('PLP-2026-07');
    expect(output.modelosGuiados.map((modelo) => modelo.id)).toEqual(['sarimax']);
  });

  it('sem ciclo ativo', async () => {
    const ciclos: CicloFonte = { listCiclos: vi.fn().mockResolvedValue([]) };
    const output = await new GetNovaAnaliseOpcoes(ciclos, fakeApoio()).execute();
    expect(output).toMatchObject({ ciclos: [], cicloAtivoId: null });
  });
});

describe('ListSkusDoCiclo (CA-05 / RN-03)', () => {
  it('agrupa por família com o nível de estoque', async () => {
    const apoio = fakeApoio();
    const grupos = await new ListSkusDoCiclo(apoio).execute('PLP-2026-07');
    expect(apoio.skusDoCiclo).toHaveBeenCalledWith('PLP-2026-07');
    expect(grupos).toEqual([
      {
        familia: 'Imunologia',
        skus: [
          { codigo: 'SKU-00312', nome: 'Baricitinibe 2mg', dias: 18, nivelEstoque: 'critico' },
          { codigo: 'SKU-00313', nome: 'Baricitinibe 4mg', dias: 0, nivelEstoque: null },
        ],
      },
      {
        familia: 'Cardio',
        skus: [{ codigo: 'SKU-00058', nome: 'Apixabana 5mg', dias: 45, nivelEstoque: 'atencao' }],
      },
    ]);
  });

  it('sem ciclo não consulta', async () => {
    const apoio = fakeApoio();
    await expect(new ListSkusDoCiclo(apoio).execute('')).resolves.toEqual([]);
    expect(apoio.skusDoCiclo).not.toHaveBeenCalled();
  });
});

describe('ListDriversSugeridos (CA-06)', () => {
  it('lista os aprovados com limite 50', async () => {
    const driver = {
      id: 'DRV-2026-032',
      tipo: '📺 TV',
      produto: 'Baricitinibe',
      params: 'Canal: Globo',
      intensidade: 4,
    };
    const fonte: DriverAprovadoFonte = {
      listAprovados: vi.fn().mockResolvedValue({ items: [driver], total: 9, page: 1, limit: 50 }),
    };
    await expect(new ListDriversSugeridos(fonte).execute()).resolves.toEqual({
      itens: [driver],
      total: 9,
    });
    expect(fonte.listAprovados).toHaveBeenCalledWith(50);
  });
});

describe('ExecutarAnalise (CA-08 / RN-04 / RN-05)', () => {
  it('cria o rascunho com UUID, ANL-003, data de hoje e o mock; espera 2 s', async () => {
    const repository = fakeRepository();
    const apoio = fakeApoio();
    const esperar = vi.fn().mockResolvedValue(undefined);
    const form = buildNovaAnaliseForm({
      configModelo: { modo: 'avancado', modelo: 'sarimax', parametros: { p: 1, s: 1 } },
      horizonteTexto: '3',
    });
    const output = await new ExecutarAnalise(
      repository,
      apoio,
      agora,
      () => 'uuid-123',
      esperar,
    ).execute(form);
    expect(output).toEqual({ id: 'uuid-123' });
    expect(esperar).toHaveBeenCalledWith(2000);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'uuid-123',
        codigo: 'ANL-003',
        status: 'rascunho',
        criada: '27/10/2026',
        modelo: 'Automático → SARIMAX',
        drivers: ['DRV-2026-032'],
        configModelo: {
          modo: 'avancado',
          modelo: 'sarimax',
          parametros: { p: 1, s: 1 },
          horizonte: 3,
        },
        salvoEm: null,
      }),
    );
  });

  it('form inválido falha antes de qualquer chamada', async () => {
    const repository = fakeRepository();
    const esperar = vi.fn();
    const executar = new ExecutarAnalise(repository, fakeApoio(), agora, () => 'x', esperar);
    await expect(executar.execute(buildNovaAnaliseForm({ titulo: '' }))).rejects.toBeInstanceOf(
      AnaliseInvalidaError,
    );
    expect(esperar).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('sem análises começa em ANL-001', async () => {
    const repository = fakeRepository();
    repository.maiorCodigo.mockResolvedValue(null);
    await new ExecutarAnalise(
      repository,
      fakeApoio(),
      agora,
      () => 'x',
      async () => undefined,
    ).execute(buildNovaAnaliseForm());
    expect(repository.create.mock.calls[0]?.[0]).toMatchObject({ codigo: 'ANL-001' });
  });
});

describe('SalvarAnalise e ExportarPdfAnalise (CA-12 / RN-06 / RN-07)', () => {
  it('salvar grava salva e salvo_em; relatório continua relatório', async () => {
    const rascunho = fakeRepository(buildAnalise({ status: 'rascunho' }));
    await expect(new SalvarAnalise(rascunho, agora).execute('ANL-001')).resolves.toBe('salva');
    expect(rascunho.update).toHaveBeenCalledWith('ANL-001', {
      status: 'salva',
      salvoEm: '27/10/2026 14:05',
    });
    const relatorio = fakeRepository(buildAnalise({ status: 'relatorio' }));
    await expect(new SalvarAnalise(relatorio, agora).execute('ANL-002')).resolves.toBe('relatorio');
  });

  it('exportar grava relatório; rascunho é recusado', async () => {
    const salva = fakeRepository();
    await expect(new ExportarPdfAnalise(salva).execute('ANL-001')).resolves.toBe('relatorio');
    expect(salva.update).toHaveBeenCalledWith('ANL-001', { status: 'relatorio' });
    const rascunho = fakeRepository(buildAnalise({ status: 'rascunho' }));
    await expect(new ExportarPdfAnalise(rascunho).execute('ANL-001')).rejects.toThrow(
      '⚠️ Salve antes de emitir o relatório.',
    );
    expect(rascunho.update).not.toHaveBeenCalled();
  });
});

describe('DocumentarInteracao e ResponderChat (CA-13 / RN-10 / RN-11)', () => {
  it('acrescenta a interação com ts ao histórico', async () => {
    const anterior = { pergunta: 'p0', resposta: 'r0', ts: null };
    const repository = fakeRepository(buildAnalise({ historicoIa: [anterior] }));
    const historico = await new DocumentarInteracao(repository, agora).execute({
      id: 'ANL-001',
      pergunta: 'p1',
      resposta: 'r1',
    });
    const esperado = [anterior, { pergunta: 'p1', resposta: 'r1', ts: '27/10/2026 14:05' }];
    expect(historico).toEqual(esperado);
    expect(repository.update).toHaveBeenCalledWith('ANL-001', { historicoIa: esperado });
  });

  it('responde após 1,4 s com as regras de config.chatRespostas', async () => {
    const esperar = vi.fn().mockResolvedValue(undefined);
    const responder = new ResponderChat(fakeApoio(), esperar);
    await expect(
      responder.execute({ pergunta: 'qual o lag?', ciclo: 'PLP-2026-07', modelo: 'SARIMAX' }),
    ).resolves.toBe('O lag de +1 mês em campanhas digitais…');
    await expect(
      responder.execute({ pergunta: 'oi', ciclo: 'PLP-2026-07', modelo: 'SARIMAX' }),
    ).resolves.toContain('(ciclo PLP-2026-07, modelo SARIMAX)');
    expect(esperar).toHaveBeenCalledWith(1400);
  });
});
