const EMPTY = '—';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const compactNumber = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number | null): string {
  return value === null ? EMPTY : currency.format(value);
}

export function formatInteger(value: number): string {
  return integer.format(value);
}

export function formatCompact(value: number): string {
  return compactNumber.format(value);
}

export function formatPercent(value: number | null): string {
  return value === null ? EMPTY : `${decimal.format(value)}%`;
}

export function formatRoas(value: number | null): string {
  return value === null ? EMPTY : `${decimal.format(value)}x`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

export function formatPeriod(startIso: string, endIso: string): string {
  return `${formatDate(startIso)} – ${formatDate(endIso)}`;
}
