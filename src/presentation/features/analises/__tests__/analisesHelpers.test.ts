import { buildAnalise } from '@test/fixtures/analises';
import { comparacaoComVsSemDrivers } from '@domain/analises/comparacao';
import type { TooltipItem } from 'chart.js';
import {
  formatarDelta,
  formatarDeltaPct,
  formatarMilhar,
  formatarUnidades,
  tickMilhar,
  tomDelta,
} from '../analiseFormat';
import { rotuloContagem, statusDoFiltro } from '../analisesUrl';
import {
  buildComparacaoChart,
  coresDosTokens,
  rodapeTooltip,
  rotuloTooltip,
  valLabelsPlugin,
} from '../chart/buildComparacaoChart';
import { tomDaFamilia, tomEstoque } from '../familiaTom';
import { FALHA_ESCRITA_ANALISE, mensagemFalhaAnalise } from '../falhaEscrita';
import { AnaliseInvalidaError } from '@domain/analises/AnaliseInvalidaError';
import { NotFoundError } from '@domain/shared/DomainError';

const CORES = { blue: 'B', muted2: 'M2', muted: 'M', fill: 'F', grid: 'G' };

function item(label: string, y: number): TooltipItem<'line'> {
  return { dataset: { label }, parsed: { y } } as unknown as TooltipItem<'line'>;
}

describe('formatarMilhar e formatos pt-BR (CA-11)', () => {
  it('milhar com vírgula sem ",0"; abaixo de mil sem sufixo', () => {
    expect(formatarMilhar(40700)).toBe('40,7k');
    expect(formatarMilhar(41000)).toBe('41k');
    expect(formatarMilhar(950)).toBe('950');
    expect(formatarUnidades(76814)).toBe('76.814');
    expect(formatarDelta(4321)).toBe('+4.321');
    expect(formatarDelta(-5)).toBe('-5');
    expect(formatarDeltaPct(5.6)).toBe('+5,6%');
    expect(formatarDeltaPct(-3.3)).toBe('-3,3%');
    expect(formatarDeltaPct(null)).toBe('—');
    expect(tickMilhar(41000)).toBe('41k');
    expect(tickMilhar(500)).toBe(500);
    expect(tickMilhar('x')).toBe('x');
    expect(tomDelta(1)).toBe('text-apsen-green');
    expect(tomDelta(-1)).toBe('text-apsen-red');
  });
});

describe('buildComparacaoChart (CA-11)', () => {
  const comparacao = comparacaoComVsSemDrivers(buildAnalise());

  it('datasets e opções do protótipo, com as cores dos tokens', () => {
    const { data, options, plugins } = buildComparacaoChart(comparacao, CORES);
    expect(data.labels).toHaveLength(12);
    const [com, sem] = data.datasets;
    expect(com).toMatchObject({
      label: 'Com drivers',
      borderColor: 'B',
      backgroundColor: 'F',
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
    });
    expect(sem).toMatchObject({
      label: 'Sem drivers',
      borderColor: 'M2',
      borderDash: [6, 4],
      fill: false,
    });
    expect(data.datasets.slice(2).map((dataset) => dataset.label)).toEqual([
      'Limite superior (80%)',
      'Limite inferior (80%)',
    ]);
    expect(data.datasets[2]?.data).toEqual(comparacao.incerteza.linhas.map((faixa) => faixa.max));
    expect(data.datasets[3]?.data).toEqual(comparacao.incerteza.linhas.map((faixa) => faixa.min));
    expect(options.plugins?.legend?.display).toBe(false);
    expect(options.maintainAspectRatio).toBe(false);
    expect(options.scales?.y?.grid?.color).toBe('G');
    expect(plugins[0]?.id).toBe('valLabels');
  });

  it('tooltip com unidades e Δ drivers', () => {
    expect(rotuloTooltip(item('Com drivers', 76814))).toBe(' Com drivers: 76.814 un');
    expect(rodapeTooltip([item('Com drivers', 1135), item('Sem drivers', 1000)])).toEqual([
      '',
      '  Δ drivers: +135 un (+13,5%)',
    ]);
    expect(rodapeTooltip([item('Com drivers', 1)])).toEqual([]);
    expect(rodapeTooltip([item('a', 1), item('b', 0)])[1]).toContain('(—)');
  });

  it('plugin valLabels escreve os valores acima e abaixo dos pontos', () => {
    const fillText = vi.fn();
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText,
      font: '',
      fillStyle: '',
      textAlign: '',
    };
    const chart = {
      ctx,
      data: { datasets: [{ data: [40700] }, { data: [950] }, { data: [1] }] },
      getDatasetMeta: (i: number) => ({ hidden: i === 2, data: [{ x: 10, y: 50 }] }),
    };
    valLabelsPlugin(CORES).afterDatasetsDraw?.(
      chart as never,
      {} as never,
      {} as never,
      {} as never,
    );
    expect(fillText).toHaveBeenCalledWith('40,7k', 10, 42);
    expect(fillText).toHaveBeenCalledWith('950', 10, 64);
    expect(fillText).toHaveBeenCalledTimes(2);
  });

  it('coresDosTokens lê as variáveis CSS', () => {
    expect(coresDosTokens({ '--color-apsen-blue': '#00f' })).toMatchObject({
      blue: '#00f',
      grid: '',
    });
  });
});

describe('demais helpers', () => {
  it('filtro de status e contagem', () => {
    expect(statusDoFiltro('salva')).toBe('salva');
    expect(statusDoFiltro('xyz')).toBe('');
    expect(rotuloContagem(1)).toBe('análise');
    expect(rotuloContagem(2)).toBe('análises');
  });

  it('tons por família e por estoque', () => {
    expect(tomDaFamilia('Imunologia').texto).toBe('text-apsen-pal-purple');
    expect(tomDaFamilia('Outra').texto).toBe('text-apsen-pal-slate');
    expect(tomEstoque('critico')).toBe('text-apsen-red');
    expect(tomEstoque('atencao')).toBe('text-apsen-yellow');
    expect(tomEstoque('ok')).toBe('text-apsen-green');
  });

  it('mensagem de falha de escrita', () => {
    expect(
      mensagemFalhaAnalise(new AnaliseInvalidaError('⚠️ Salve antes de emitir o relatório.')),
    ).toBe('⚠️ Salve antes de emitir o relatório.');
    expect(mensagemFalhaAnalise(new NotFoundError('Análise', 'x'))).toBe(FALHA_ESCRITA_ANALISE);
    expect(mensagemFalhaAnalise(new Error('500'))).toBe(
      '⚠️ Não foi possível salvar. Tente novamente.',
    );
  });
});
