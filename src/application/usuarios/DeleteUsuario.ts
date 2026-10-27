import { UsuarioProtegidoError } from '@domain/usuarios/errors';
import type { UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import { USUARIO_REMOVIDO_TOAST, type UsuarioToastDto } from './dto';

export class DeleteUsuario {
  constructor(private readonly repository: UsuarioRepository) {}

  async execute(id: string): Promise<UsuarioToastDto> {
    const usuario = await this.repository.get(id);
    if (!usuario.removivel) {
      throw new UsuarioProtegidoError();
    }
    await this.repository.delete(id);
    return { toast: USUARIO_REMOVIDO_TOAST };
  }
}
