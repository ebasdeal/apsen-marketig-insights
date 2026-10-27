import { aprovacoesKeys } from './aprovacoes/aprovacoesKeys';
import { ingeridosKeys } from './ingeridos/ingeridosKeys';
import { tiposKeys } from './tipos/tiposKeys';

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
  tipos: tiposKeys,
  aprovacoes: aprovacoesKeys,
  ingeridos: ingeridosKeys,
};
