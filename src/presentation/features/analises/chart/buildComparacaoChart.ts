import type { Comparacao } from '@domain/analises/Analise';
import type { ChartData, ChartOptions, Plugin, TooltipItem } from 'chart.js';
import {
  formatarDelta,
  formatarDeltaPct,
  formatarMilhar,
  formatarUnidades,
  tickMilhar,
} from '../analiseFormat';

const PREFIXO_LIMITE = 'Limite ';

export interface CoresGrafico {
  blue: string;
  muted2: string;
  muted: string;
  fill: string;
  grid: string;
}

export const TOKENS_GRAFICO = [
  '--color-apsen-blue',
  '--color-apsen-muted-2',
  '--color-apsen-muted',
  '--color-apsen-chart-fill',
  '--color-apsen-chart-grid',
] as const;

export function coresDosTokens(valores: Record<string, string>): CoresGrafico {
  return {
    blue: valores['--color-apsen-blue'] ?? '',
    muted2: valores['--color-apsen-muted-2'] ?? '',
    muted: valores['--color-apsen-muted'] ?? '',
    fill: valores['--color-apsen-chart-fill'] ?? '',
    grid: valores['--color-apsen-chart-grid'] ?? '',
  };
}

type LinhaItem = TooltipItem<'line'>;

export function rotuloTooltip(item: LinhaItem): string {
  return ` ${item.dataset.label ?? ''}: ${formatarUnidades(item.parsed.y ?? 0)} un`;
}

export function rodapeTooltip(items: readonly LinhaItem[]): string[] {
  const [com, sem] = items;
  if (com === undefined || sem === undefined) {
    return [];
  }
  const delta = (com.parsed.y ?? 0) - (sem.parsed.y ?? 0);
  const base = sem.parsed.y ?? 0;
  const pct = base === 0 ? null : Math.round((delta / base) * 1000) / 10;
  return ['', `  Δ drivers: ${formatarDelta(delta)} un (${formatarDeltaPct(pct)})`];
}

export function valLabelsPlugin(cores: CoresGrafico): Plugin<'line'> {
  return {
    id: 'valLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((dataset, index) => {
        const meta = chart.getDatasetMeta(index);
        if (meta.hidden) return;
        if (dataset.label?.startsWith(PREFIXO_LIMITE) === true) return;
        meta.data.forEach((ponto, i) => {
          const valor = Number(dataset.data[i] ?? 0);
          ctx.save();
          ctx.font = `${index === 0 ? '700' : '400'} 9.5px Inter, sans-serif`;
          ctx.fillStyle = index === 0 ? cores.blue : cores.muted2;
          ctx.textAlign = 'center';
          ctx.fillText(formatarMilhar(valor), ponto.x, ponto.y + (index === 0 ? -8 : 14));
          ctx.restore();
        });
      });
    },
  };
}

export function buildComparacaoChart(comparacao: Comparacao, cores: CoresGrafico) {
  const data: ChartData<'line'> = {
    labels: comparacao.linhas.map((linha) => linha.mes),
    datasets: [
      {
        label: 'Com drivers',
        data: comparacao.linhas.map((linha) => linha.com),
        borderColor: cores.blue,
        backgroundColor: cores.fill,
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
      },
      {
        label: 'Sem drivers',
        data: comparacao.linhas.map((linha) => linha.sem),
        borderColor: cores.muted2,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 4],
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: false,
      },
      ...(['superior', 'inferior'] as const).map((lado) => ({
        label: `${PREFIXO_LIMITE}${lado} (${comparacao.incerteza.nivel}%)`,
        data: comparacao.incerteza.linhas.map((faixa) =>
          lado === 'superior' ? faixa.max : faixa.min,
        ),
        borderColor: cores.muted,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [2, 3],
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
      })),
    ],
  };
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 18, bottom: 6 } },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: rotuloTooltip, afterBody: rodapeTooltip } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: cores.muted } },
      y: {
        ticks: { font: { size: 10 }, color: cores.muted, callback: tickMilhar },
        grid: { color: cores.grid },
      },
    },
  };
  return { data, options, plugins: [valLabelsPlugin(cores)] };
}
