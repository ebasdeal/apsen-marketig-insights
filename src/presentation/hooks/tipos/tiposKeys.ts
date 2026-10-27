import type { ListTiposInput } from '@application/tipos/dto';
import type { CategoriaSlug } from '@domain/tipos/Tipo';

export const tiposKeys = {
  all: ['tipos'] as const,
  pages: () => ['tipos', 'page'] as const,
  page: (input: ListTiposInput) => ['tipos', 'page', input] as const,
  resumos: () => ['tipos', 'resumo'] as const,
  resumo: (cat: CategoriaSlug | undefined) => ['tipos', 'resumo', cat ?? 'all'] as const,
  form: (id: string) => ['tipos', 'form', id] as const,
  categorias: () => ['tipos', 'categorias'] as const,
};
