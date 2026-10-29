import type { ListRestricoesInput } from '@application/restricoes/dto';

export const restricoesKeys = {
  all: ['restricoes'] as const,
  list: (input: ListRestricoesInput) => ['restricoes', 'list', input] as const,
  contagem: () => ['restricoes', 'contagem'] as const,
};
