import { analisesKeys } from './analises/analisesKeys';
import { ciclosKeys } from './ciclos/ciclosKeys';
import { fontesKeys } from './fontes/fontesKeys';
import { planosKeys } from './planos/planosKeys';
import { restricoesKeys } from './restricoes/restricoesKeys';

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
  analises: analisesKeys,
  ciclos: ciclosKeys,
  fontes: fontesKeys,
  restricoes: restricoesKeys,
  planos: planosKeys,
};
