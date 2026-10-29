import type { UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import { descreverAlteracao } from '@domain/usuarios/usuarioRules';
import { USUARIO_AREAS } from '@domain/usuarios/vocabulario';
import type { UsuarioFormDto } from './dto';

export class GetUsuarioForm {
  constructor(private readonly repository: UsuarioRepository) {}

  async execute(id: string): Promise<UsuarioFormDto> {
    const usuario = await this.repository.get(id);
    const areaConhecida = usuario.area.trim() === '' || USUARIO_AREAS.includes(usuario.area);
    return {
      draft: {
        nome: usuario.nome,
        email: usuario.email,
        area: usuario.area,
        perfil: usuario.perfil,
        categorias: [...usuario.categorias],
        ativo: usuario.ativo,
      },
      areaExtra: areaConhecida ? null : usuario.area,
      alteracao: descreverAlteracao(usuario.alteradoPor, usuario.alteradoEm),
    };
  }
}
