import type { TipoRepository } from '@domain/tipos/TipoRepository';
import { autoria } from '@domain/tipos/tipoRules';
import type { ToastDto, ToggleTipoInput } from './dto';

export function toggleToast(slug: string, ativo: boolean): string {
  return ativo ? `✅ "${slug}" ativado.` : `⏸ "${slug}" desativado.`;
}

export class ToggleTipoAtivo {
  constructor(
    private readonly repository: TipoRepository,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async execute({ id, slug, ativo, por }: ToggleTipoInput): Promise<ToastDto> {
    await this.repository.update(id, { ativo, ...autoria(por, this.clock()) });
    return { toast: toggleToast(slug, ativo) };
  }
}
