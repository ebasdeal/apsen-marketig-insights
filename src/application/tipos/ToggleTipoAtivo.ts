import type { TipoRepository } from '@domain/tipos/TipoRepository';
import type { ToastDto, ToggleTipoInput } from './dto';

export function toggleToast(slug: string, ativo: boolean): string {
  return ativo ? `✅ "${slug}" ativado.` : `⏸ "${slug}" desativado.`;
}

export class ToggleTipoAtivo {
  constructor(private readonly repository: TipoRepository) {}

  async execute({ id, slug, ativo }: ToggleTipoInput): Promise<ToastDto> {
    await this.repository.update(id, { ativo });
    return { toast: toggleToast(slug, ativo) };
  }
}
