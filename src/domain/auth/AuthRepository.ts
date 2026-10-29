import type { Sessao, UsuarioSessao } from './Sessao';

export interface AuthRepository {
  trocarCodigo(code: string): Promise<Sessao>;
  me(): Promise<UsuarioSessao>;
  logout(): Promise<void>;
}
