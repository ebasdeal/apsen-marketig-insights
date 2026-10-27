import { catalogoKeys } from './catalogo/catalogoKeys';
import { driversKeys } from './drivers/driversKeys';

export const queryKeys = {
  auth: {
    me: (usuarioId: string) => ['auth', 'me', usuarioId] as const,
  },
  perfis: {
    all: ['perfis'] as const,
    list: () => ['perfis', 'list'] as const,
  },
  navegacao: {
    badges: () => ['navegacao', 'badges'] as const,
  },
  drivers: driversKeys,
  catalogo: catalogoKeys,
};
