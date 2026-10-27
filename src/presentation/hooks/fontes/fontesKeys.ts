export interface FontesPageParams {
  page: number;
  size: number;
}

export const fontesKeys = {
  all: ['fontes'] as const,
  pages: () => ['fontes', 'page'] as const,
  page: (params: FontesPageParams) => ['fontes', 'page', params] as const,
  options: () => ['fontes', 'options'] as const,
};
