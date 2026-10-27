import type { TipoRepository } from '@domain/tipos/TipoRepository';
import { sincronizarCategorias } from './categoriaSync';
import type { TipoRefInput, ToastDto } from './dto';

export const TIPO_REMOVIDO = '🗑 Tipo removido.';

export class DeleteTipo {
  constructor(private readonly repository: TipoRepository) {}

  async execute({ id, slug }: TipoRefInput): Promise<ToastDto> {
    await this.repository.delete(id);
    await this.repository.deleteCampos(id);
    await sincronizarCategorias(this.repository, await this.repository.listCategorias(), {
      slug,
      label: '',
      catNova: null,
      remover: true,
    });
    return { toast: TIPO_REMOVIDO };
  }
}
