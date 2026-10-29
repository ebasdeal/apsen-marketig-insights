import type { FontesPageDto } from '@application/fontes/dto';

export function applyRemoveToPage(page: FontesPageDto, id: string): FontesPageDto {
  const items = page.items.filter((item) => item.id !== id);
  if (items.length === page.items.length) {
    return page;
  }
  return { ...page, items, total: Math.max(0, page.total - 1) };
}
