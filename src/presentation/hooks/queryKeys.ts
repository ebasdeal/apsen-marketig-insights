import { analisesKeys } from './analises/analisesKeys';
import { ciclosKeys } from './ciclos/ciclosKeys';
import { fontesKeys } from './fontes/fontesKeys';
import { planosKeys } from './planos/planosKeys';
import { restricoesKeys } from './restricoes/restricoesKeys';
import { permissoesKeys, usuariosKeys } from './usuarios/usuariosKeys';
import { agentesKeys } from './agentes/agentesKeys';
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
  analises: analisesKeys,
  ciclos: ciclosKeys,
  fontes: fontesKeys,
  restricoes: restricoesKeys,
  planos: planosKeys,
  usuarios: usuariosKeys,
  permissoes: permissoesKeys,
  agentes: agentesKeys,
  drivers: driversKeys,
  catalogo: catalogoKeys,
};
