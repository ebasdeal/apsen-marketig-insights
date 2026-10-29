import { ordenarPorNivel, type Perfil } from '@domain/perfis/Perfil';
import type { PerfilRepository } from '@domain/perfis/PerfilRepository';
import type { PerfilDto } from './dto';

function toPerfilDto(perfil: Perfil): PerfilDto {
  return {
    id: perfil.id,
    nivel: perfil.nivel,
    label: perfil.label,
    tone: perfil.tone,
    avatar: perfil.avatar,
    usuario: perfil.usuario,
    hint: perfil.hint,
  };
}

export class ListPerfis {
  constructor(private readonly repository: PerfilRepository) {}

  async execute(): Promise<PerfilDto[]> {
    return ordenarPorNivel(await this.repository.list()).map(toPerfilDto);
  }
}
