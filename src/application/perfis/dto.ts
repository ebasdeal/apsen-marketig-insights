import type { NivelAcesso, PerfilId, PerfilTone } from '@domain/perfis/Perfil';

export interface PerfilDto {
  id: PerfilId;
  nivel: NivelAcesso;
  label: string;
  tone: PerfilTone;
  avatar: string;
  usuario: string;
  hint: string;
}
