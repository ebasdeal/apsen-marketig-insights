import { formatDate } from '@presentation/format/formatters';

export function formatShortPeriod(startIso: string, endIso: string): string {
  const start = formatDate(startIso);
  const end = formatDate(endIso);
  const sameYear = start.slice(6) === end.slice(6);
  return `${sameYear ? start.slice(0, 5) : start} → ${end}`;
}
