import type { ListAnalisesInput } from '@application/analises/dto';

export const analisesKeys = {
  all: ['analises'] as const,
  list: (input: ListAnalisesInput) => ['analises', 'list', input] as const,
  total: () => ['analises', 'total'] as const,
  detail: (id: string) => ['analises', 'detail', id] as const,
  opcoes: () => ['analises', 'opcoes'] as const,
  skusCiclo: (ciclo: string) => ['analises', 'skusCiclo', ciclo] as const,
  driversSugeridos: () => ['analises', 'driversSugeridos'] as const,
};
