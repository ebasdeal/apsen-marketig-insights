import { normalizarUsuarioId, type Usuario } from '@domain/usuarios/Usuario';
import type { UsuarioApiDto } from './usuarioSchema';

export function toUsuario(dto: UsuarioApiDto): Usuario {
  return {
    id: normalizarUsuarioId(dto.id),
    nome: dto.nome,
    email: dto.email,
    perfil: dto.perfil,
    perfilLabel: dto.perfilLabel,
    area: dto.area,
    podeRegistrar: dto.podeRegistrar,
    podeValidar: dto.podeValidar,
    admin: dto.admin,
    ultimoAcesso: dto.ultimoAcesso,
    ativo: dto.ativo,
    removivel: dto.removivel,
    categorias: dto.categorias ?? [],
    alteradoPor: dto.alteradoPor ?? null,
    alteradoEm: dto.alteradoEm ?? null,
  };
}
