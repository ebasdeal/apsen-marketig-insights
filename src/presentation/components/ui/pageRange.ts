export type PaginationItem = number | 'ellipsis';

export function pageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}

export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}

export function pageSlice<T>(items: readonly T[], page: number, perPage: number): readonly T[] {
  return items.slice((page - 1) * perPage, page * perPage);
}

export function pageRangeLabel(page: number, perPage: number, total: number): string {
  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);
  return `Mostrando ${first}–${last} de ${total}`;
}

export function paginationItems(page: number, totalPages: number): readonly PaginationItem[] {
  const items: PaginationItem[] = [];
  for (let current = 1; current <= totalPages; current += 1) {
    const distance = Math.abs(current - page);
    if (current === 1 || current === totalPages || distance <= 1) {
      items.push(current);
    } else if (distance === 2) {
      items.push('ellipsis');
    }
  }
  return items;
}
