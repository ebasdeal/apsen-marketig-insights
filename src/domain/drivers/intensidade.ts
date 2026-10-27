import type { Intensidade } from './Driver';
import type { IntensidadeInfo } from './lookups';

export const DICA_UPLIFT_MANUAL = 'Valor ajustado manualmente.';

export function infoIntensidade(
  n: Intensidade,
  intensidades: readonly IntensidadeInfo[],
): IntensidadeInfo | undefined {
  return intensidades.find((info) => info.id === n);
}

export function upliftSugerido(n: Intensidade, intensidades: readonly IntensidadeInfo[]): string {
  const info = infoIntensidade(n, intensidades);
  return info === undefined ? '' : String(info.default);
}

export interface LegendaIntensidade {
  titulo: string;
  faixa: string;
  descricao: string;
}

export function legendaIntensidade(
  n: Intensidade,
  intensidades: readonly IntensidadeInfo[],
): LegendaIntensidade | null {
  const info = infoIntensidade(n, intensidades);
  if (info === undefined) {
    return null;
  }
  return { titulo: `${n} — ${info.label}`, faixa: info.faixa, descricao: info.desc };
}

export function dicaUplift(manual: boolean, info: IntensidadeInfo | undefined): string {
  if (manual) {
    return DICA_UPLIFT_MANUAL;
  }
  return info === undefined
    ? ''
    : `Sugerido pela intensidade (${info.faixa}) — ajuste se necessário.`;
}
