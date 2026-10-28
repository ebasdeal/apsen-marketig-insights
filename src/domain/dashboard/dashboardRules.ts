import type { ContagemRotulada } from './DashboardOverview';

export function percentual(n: number, total: number): number | null {
  return total === 0 ? null : Math.round((n / total) * 100);
}

export interface Barra extends ContagemRotulada {
  max: number;
}

export function barras(contagens: readonly ContagemRotulada[], somentePositivos = false): Barra[] {
  const max = Math.max(1, ...contagens.map((contagem) => contagem.n));
  return contagens
    .filter((contagem) => !somentePositivos || contagem.n > 0)
    .map((contagem) => ({ ...contagem, max }));
}

export function produtoCurto(produto: string): string {
  const antesDoTraco = produto.split('—')[0] ?? '';
  return (antesDoTraco.trim().split('·')[0] ?? '').trim();
}

export function restantesPendentes(total: number, exibidos: number): number {
  return Math.max(total - exibidos, 0);
}
