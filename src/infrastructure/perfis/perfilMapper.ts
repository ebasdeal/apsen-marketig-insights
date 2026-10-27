import type { NivelAcesso, Perfil, PerfilTone } from '@domain/perfis/Perfil';
import type { PerfilApiDto } from './perfilSchema';

const VAR_PREFIX = 'var(--';

function toneOf(color: string): PerfilTone {
  return color.slice(VAR_PREFIX.length, -1) as PerfilTone;
}

export function toPerfil(dto: PerfilApiDto): Perfil {
  return {
    id: dto.id,
    nivel: dto.level as NivelAcesso,
    label: dto.label,
    tone: toneOf(dto.color),
    avatar: dto.av,
    usuario: dto.user,
    hint: dto.hint,
  };
}
