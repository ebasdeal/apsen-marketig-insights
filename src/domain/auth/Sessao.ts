import type { PerfilId } from '../perfis/Perfil';

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilId;
  perfilLabel: string;
  area: string;
  ativo: boolean;
}

export interface Sessao {
  token: string;
  usuario: UsuarioSessao;
}
