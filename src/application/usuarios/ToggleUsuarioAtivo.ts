import type { UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import type { ToggleUsuarioInput } from './dto';

export class ToggleUsuarioAtivo {
  constructor(
    private readonly repository: UsuarioRepository,
    private readonly now: () => Date,
  ) {}

  async execute({ id, ativo, alteradoPor }: ToggleUsuarioInput): Promise<void> {
    await this.repository.update(id, {
      ativo,
      alteradoPor,
      alteradoEm: this.now().toISOString(),
    });
  }
}
