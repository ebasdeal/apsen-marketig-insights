'use client';

import type { Comparacao } from '@domain/analises/Analise';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useCssColorTokens } from '../../../hooks/useCssColorTokens';
import { buildComparacaoChart, coresDosTokens, TOKENS_GRAFICO } from './buildComparacaoChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export const ROTULO_GRAFICO = 'Gráfico de previsão com e sem drivers; detalhes na tabela abaixo';

export default function ComparacaoChart({ comparacao }: { comparacao: Comparacao }) {
  const tokens = useCssColorTokens(TOKENS_GRAFICO);
  const config = useMemo(
    () => buildComparacaoChart(comparacao, coresDosTokens(tokens)),
    [comparacao, tokens],
  );
  return (
    <Line
      key={Object.values(tokens).join('|')}
      data={config.data}
      options={config.options}
      plugins={config.plugins}
      role="img"
      aria-label={ROTULO_GRAFICO}
    />
  );
}
