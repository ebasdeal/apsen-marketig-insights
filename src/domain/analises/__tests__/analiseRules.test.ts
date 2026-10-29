import { buildNovaAnaliseForm, RESULTADO_MOCK } from '@test/fixtures/analises';
import { dataBr, dataHoraBr } from '../analiseDatas';
import {
  ANALISE_STATUS_FILTRO,
  ANALISE_STATUS_LABEL,
  ANALISE_TIPOS,
  MODELOS_AVANCADOS,
  PARAMS_SARIMAX,
  PDF_SECOES,
} from '../analiseConstants';
import { AnaliseInvalidaError } from '../AnaliseInvalidaError';
import {
  agruparPorFamilia,
  cicloAtivo,
  exportarPdf,
  larguraBarraImpacto,
  nivelEstoque,
  novaAnalise,
  podeExportarPdf,
  proximoCodigoAnalise,
  rotuloCiclo,
  segmentosRichText,
  statusAoSalvar,
  validarNovaAnalise,
} from '../analiseRules';

function erroDe(fn: () => unknown): AnaliseInvalidaError {
  try {
    fn();
  } catch (error) {
    if (error instanceof AnaliseInvalidaError) {
      return error;
    }
    throw error;
  }
  throw new Error('não lançou');
}

describe('constantes', () => {
  it('rótulos de status, filtro, tipos, modelos, parâmetros e seções do PDF', () => {
    expect(ANALISE_STATUS_LABEL).toEqual({
      rascunho: '📝 Rascunho',
      salva: '✅ Salva',
      relatorio: '📄 Relatório',
    });
    expect(ANALISE_STATUS_FILTRO.map((opcao) => opcao.label)).toEqual([
      'Todos os status',
      '📝 Rascunho',
      '✅ Salva',
      '📄 Relatório emitido',
    ]);
    expect(ANALISE_TIPOS).toHaveLength(6);
    expect(MODELOS_AVANCADOS.map((modelo) => modelo.value)).toEqual([
      'sarimax',
      'prophet',
      'regressao_causal',
      'holt_winters',
      'media_movel',
      'ensemble',
    ]);
    expect(PARAMS_SARIMAX.join('')).toBe('pdqPDQs');
    expect(PDF_SECOES.filter((secao) => !secao.marcada).map((secao) => secao.label)).toEqual([
      'Interações com IA',
    ]);
  });
});

describe('proximoCodigoAnalise (RN-05)', () => {
  it('soma 1 ao maior código com 3 dígitos; sem código começa em ANL-001', () => {
    expect(proximoCodigoAnalise('ANL-002')).toBe('ANL-003');
    expect(proximoCodigoAnalise('ANL-099')).toBe('ANL-100');
    expect(proximoCodigoAnalise('ANL-1234')).toBe('ANL-1235');
    expect(proximoCodigoAnalise(null)).toBe('ANL-001');
    expect(proximoCodigoAnalise('9a7c-uuid')).toBe('ANL-001');
  });
});

describe('validarNovaAnalise (CA-08 / RN-04)', () => {
  it('valida título, ciclo e SKUs nesta ordem, com mensagem e campo', () => {
    const vazio = buildNovaAnaliseForm({ titulo: '   ', ciclo: '', skus: [] });
    expect(erroDe(() => validarNovaAnalise(vazio))).toMatchObject({
      message: '⚠️ Informe o título.',
      campo: 'titulo',
    });
    expect(erroDe(() => validarNovaAnalise({ ...vazio, titulo: 'X' }))).toMatchObject({
      message: '⚠️ Selecione o ciclo.',
      campo: 'ciclo',
    });
    expect(
      erroDe(() => validarNovaAnalise({ ...vazio, titulo: 'X', ciclo: 'PLP-2026-07' })),
    ).toMatchObject({ message: '⚠️ Selecione ao menos um SKU.', campo: 'skus' });
    expect(() => validarNovaAnalise(buildNovaAnaliseForm())).not.toThrow();
  });

  it('no modo avançado exige horizonte inteiro entre 1 e 24', () => {
    const avancado = (horizonteTexto: string) =>
      buildNovaAnaliseForm({
        configModelo: { modo: 'avancado', modelo: 'sarimax' },
        horizonteTexto,
      });
    ['0', '25', '2.5', '', 'abc'].forEach((texto) => {
      expect(erroDe(() => validarNovaAnalise(avancado(texto)))).toMatchObject({
        message: '⚠️ Informe um horizonte entre 1 e 24 meses.',
        campo: 'horizonte',
      });
    });
    expect(() => validarNovaAnalise(avancado('1'))).not.toThrow();
    expect(() => validarNovaAnalise(avancado('24'))).not.toThrow();
    expect(() => validarNovaAnalise(buildNovaAnaliseForm({ horizonteTexto: '99' }))).not.toThrow();
  });
});

describe('novaAnalise (RN-05)', () => {
  const hoje = new Date(2026, 9, 27, 9, 5);

  it('cria rascunho com o resultado mock, o form e a data de hoje', () => {
    const form = buildNovaAnaliseForm({ titulo: '  Teste Cardio  ', comentarios: 'hipótese' });
    const analise = novaAnalise(form, RESULTADO_MOCK, 'uuid-1', 'ANL-003', hoje);
    expect(analise).toEqual({
      id: 'uuid-1',
      codigo: 'ANL-003',
      titulo: 'Teste Cardio',
      ciclo: 'PLP-2026-07',
      tipo: 'Impacto de drivers em SKUs específicos',
      skus: ['SKU-00058'],
      modelo: 'Automático → SARIMAX',
      status: 'rascunho',
      criada: '27/10/2026',
      comentarios: 'hipótese',
      drivers: ['DRV-2026-032'],
      configModelo: { modo: 'auto' },
      sumario: RESULTADO_MOCK.sumario,
      driversImpacto: RESULTADO_MOCK.driversImpacto,
      justificativas: RESULTADO_MOCK.justificativas,
      modeloInfo: RESULTADO_MOCK.modeloInfo,
      historicoIa: [],
      salvoEm: null,
    });
  });

  it('usa "Análise ad hoc" sem tipo e grava o horizonte numérico no modo avançado', () => {
    const form = buildNovaAnaliseForm({
      tipo: '',
      configModelo: { modo: 'avancado', modelo: 'sarimax', parametros: { p: 1 } },
      horizonteTexto: '6',
    });
    const analise = novaAnalise(form, RESULTADO_MOCK, 'uuid-2', 'ANL-004', hoje);
    expect(analise.tipo).toBe('Análise ad hoc');
    expect(analise.configModelo).toEqual({
      modo: 'avancado',
      modelo: 'sarimax',
      parametros: { p: 1 },
      horizonte: 6,
    });
  });
});

describe('status e PDF (RN-06 / RN-07)', () => {
  it('salvar não rebaixa relatório; demais viram salva', () => {
    expect(statusAoSalvar('rascunho')).toBe('salva');
    expect(statusAoSalvar('salva')).toBe('salva');
    expect(statusAoSalvar('relatorio')).toBe('relatorio');
  });

  it('PDF só fora de rascunho', () => {
    expect(podeExportarPdf('rascunho')).toBe(false);
    expect(podeExportarPdf('salva')).toBe(true);
    expect(exportarPdf('salva')).toBe('relatorio');
    expect(exportarPdf('relatorio')).toBe('relatorio');
    expect(erroDe(() => exportarPdf('rascunho')).message).toBe(
      '⚠️ Salve antes de emitir o relatório.',
    );
  });
});

describe('SKUs (RN-03)', () => {
  it('agrupa por família na ordem da primeira aparição', () => {
    const sku = (codigo: string, familia: string) => ({ codigo, nome: codigo, familia, dias: 10 });
    const grupos = agruparPorFamilia([
      sku('A', 'Imunologia'),
      sku('B', 'Cardio'),
      sku('C', 'Imunologia'),
    ]);
    expect(grupos.map((grupo) => [grupo.familia, grupo.skus.map((item) => item.codigo)])).toEqual([
      ['Imunologia', ['A', 'C']],
      ['Cardio', ['B']],
    ]);
  });

  it('nível de estoque: < 30 crítico, < 60 atenção, senão ok; 0 não exibe', () => {
    expect(nivelEstoque(18)).toBe('critico');
    expect(nivelEstoque(29)).toBe('critico');
    expect(nivelEstoque(30)).toBe('atencao');
    expect(nivelEstoque(45)).toBe('atencao');
    expect(nivelEstoque(60)).toBe('ok');
    expect(nivelEstoque(90)).toBe('ok');
    expect(nivelEstoque(0)).toBeNull();
  });
});

describe('ciclos (CA-04 / RN-02)', () => {
  const ciclos = [
    { id: 'PLP-2026-07', descricao: 'Planejamento Julho 2026', status: 'ativo' },
    { id: 'PLP-2026-06', descricao: 'Planejamento Junho 2026', status: 'encerrado' },
  ];

  it('acha o ciclo ativo', () => {
    expect(cicloAtivo(ciclos)?.id).toBe('PLP-2026-07');
    expect(cicloAtivo([])).toBeNull();
  });

  it('monta o rótulo sem "Planejamento " e marca o ativo', () => {
    expect(rotuloCiclo(ciclos[0]!, 'PLP-2026-07')).toBe('PLP-2026-07 · Julho 2026 (ativo)');
    expect(rotuloCiclo(ciclos[1]!, 'PLP-2026-07')).toBe('PLP-2026-06 · Junho 2026');
    expect(rotuloCiclo(ciclos[1]!, null)).toBe('PLP-2026-06 · Junho 2026');
  });
});

describe('larguraBarraImpacto (RN-09)', () => {
  it('usa |impacto| × 5 limitado a 120', () => {
    expect(larguraBarraImpacto(-5)).toBe(25);
    expect(larguraBarraImpacto(14)).toBe(70);
    expect(larguraBarraImpacto(30)).toBe(120);
  });
});

describe('segmentosRichText (RN-12)', () => {
  it('só <strong> vira negrito; demais tags são removidas', () => {
    expect(
      segmentosRichText(
        'Impacto de <strong>+18% no sell-out</strong> de <em>Bari</em><script>x()</script>.',
      ),
    ).toEqual([
      { texto: 'Impacto de ', forte: false },
      { texto: '+18% no sell-out', forte: true },
      { texto: ' de Barix().', forte: false },
    ]);
  });

  it('texto sem tags vira um segmento; vazio não gera segmentos', () => {
    expect(segmentosRichText('simples')).toEqual([{ texto: 'simples', forte: false }]);
    expect(segmentosRichText('')).toEqual([]);
    expect(segmentosRichText('<STRONG>A</STRONG>')).toEqual([{ texto: 'A', forte: true }]);
  });
});

describe('analiseDatas', () => {
  it('formata data e data-hora no padrão do db.json', () => {
    const data = new Date(2026, 0, 5, 7, 3);
    expect(dataBr(data)).toBe('05/01/2026');
    expect(dataHoraBr(data)).toBe('05/01/2026 07:03');
  });
});
