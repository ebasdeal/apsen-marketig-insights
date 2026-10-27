import type { UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import type { ToggleUsuarioInput } from './dto';

export class ToggleUsuarioAtivo {
  constructor(private readonly repository: UsuarioRepository) {}

  async execute({ id, ativo }: ToggleUsuarioInput): Promise<void> {
    await this.repository.update(id, { ativo });
  }
}
