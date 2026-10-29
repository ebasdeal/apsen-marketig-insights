import { pageCountOf } from '@domain/shared/Page';
import type { Usuario } from '@domain/usuarios/Usuario';
import type { UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import { descreverAlteracao, resumoUsuarios } from '@domain/usuarios/usuarioRules';
import { PERFIL_BADGE_TONE, USUARIO_PAGE_SIZE } from '@domain/usuarios/vocabulario';
import type { ListUsuariosInput, UsuarioRowDto, UsuariosPageDto } from './dto';

export function toUsuarioRowDto(usuario: Usuario): UsuarioRowDto {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    perfilLabel: usuario.perfilLabel,
    perfilTone: PERFIL_BADGE_TONE[usuario.perfil],
    area: usuario.area,
    podeRegistrar: usuario.podeRegistrar,
    podeValidar: usuario.podeValidar,
    admin: usuario.admin,
    ultimoAcesso: usuario.ultimoAcesso,
    ativo: usuario.ativo,
    removivel: usuario.removivel,
    alteracao: descreverAlteracao(usuario.alteradoPor, usuario.alteradoEm),
  };
}

export function montarUsuariosPage(
  rows: UsuarioRowDto[],
  total: number,
  size: number,
): UsuariosPageDto {
  return { rows, total, totalPages: pageCountOf(total, size), resumo: resumoUsuarios(total) };
}

export class ListUsuarios {
  constructor(private readonly repository: UsuarioRepository) {}

  async execute({
    page,
    size = USUARIO_PAGE_SIZE,
    ...filtro
  }: ListUsuariosInput): Promise<UsuariosPageDto> {
    const result = await this.repository.listPage(filtro, { page, size });
    return montarUsuariosPage(result.items.map(toUsuarioRowDto), result.total, size);
  }
}
