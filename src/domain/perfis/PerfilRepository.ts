import type { Perfil } from './Perfil';

export interface PerfilRepository {
  list(): Promise<readonly Perfil[]>;
}
