import { permissoesKeys, usuariosKeys } from './usuarios/usuariosKeys';
import { agentesKeys } from './agentes/agentesKeys';

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
  usuarios: usuariosKeys,
  permissoes: permissoesKeys,
  agentes: agentesKeys,
};
