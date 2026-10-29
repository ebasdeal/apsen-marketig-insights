export const agentesKeys = {
  all: ['agentes'] as const,
  pages: () => ['agentes', 'page'] as const,
  page: (page: number) => ['agentes', 'page', page] as const,
  resumo: () => ['agentes', 'resumo'] as const,
  form: (id: string) => ['agentes', 'form', id] as const,
};
