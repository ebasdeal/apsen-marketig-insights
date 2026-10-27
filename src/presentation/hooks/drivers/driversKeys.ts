export const driversKeys = {
  all: ['drivers'] as const,
  lists: () => ['drivers', 'list'] as const,
  list: (page: number, size: number) => ['drivers', 'list', page, size] as const,
  detail: (id: string) => ['drivers', 'detail', id] as const,
  forForm: (id: string) => ['drivers', 'form', id] as const,
  lookups: () => ['drivers', 'lookups'] as const,
  export: () => ['drivers', 'export'] as const,
  labs: (termo: string) => ['drivers', 'labs', termo] as const,
  marcas: (laboratorio: string, termo: string) =>
    ['drivers', 'marcas', laboratorio, termo] as const,
};
