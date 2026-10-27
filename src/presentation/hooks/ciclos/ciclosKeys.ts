export interface CiclosPageParams {
  page: number;
  size: number;
}

export const ciclosKeys = {
  all: ['ciclos'] as const,
  pages: () => ['ciclos', 'page'] as const,
  page: (params: CiclosPageParams) => ['ciclos', 'page', params] as const,
  resumo: () => ['ciclos', 'resumo'] as const,
};
