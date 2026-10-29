import { pageCountOf } from '@domain/shared/Page';
import type { UrlStateSpec } from '@presentation/navigation/urlState';

export const PAGE_SPEC = {
  page: { kind: 'int', default: 1, min: 1 },
  size: { kind: 'enum', default: '10', values: ['10', '25', '50'] },
} as const satisfies UrlStateSpec;

export const PAGE_SIZE_SELECTOR_MIN = 50;

export function pageInfo(page: number, size: number, total: number): string {
  const inicio = total === 0 ? 0 : (page - 1) * size + 1;
  const fim = Math.min(page * size, total);
  return `Mostrando ${inicio}–${fim} de ${total}`;
}

export function lastPage(total: number, size: number): number {
  return pageCountOf(total, size);
}
