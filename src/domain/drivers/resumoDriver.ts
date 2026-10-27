import type { Driver, Periodo } from './Driver';

export const LIMITE_PARAMETROS_RESUMO = 4;

const MAX_ESTRELAS = 5;

export interface ParametroResumo {
  chave: string;
  valor: string;
}

export function estrelas(n: number): string {
  const cheias = Math.min(MAX_ESTRELAS, Math.max(0, Math.trunc(n)));
  return '★'.repeat(cheias) + '☆'.repeat(MAX_ESTRELAS - cheias);
}

export function periodoTexto(periodo: Periodo): string {
  return `${periodo.inicio} → ${periodo.fim}`;
}

export function parametrosResumo(parametros: Readonly<Record<string, string>>): ParametroResumo[] {
  return Object.entries(parametros)
    .slice(0, LIMITE_PARAMETROS_RESUMO)
    .map(([chave, valor]) => ({ chave: chave.replaceAll('_', ' '), valor }));
}

export function tituloDoDriver(driver: Pick<Driver, 'produto' | 'titulo'>): string {
  const produto = driver.produto === '' ? '—' : driver.produto;
  return driver.titulo === '' ? produto : `${produto} — ${driver.titulo}`;
}
