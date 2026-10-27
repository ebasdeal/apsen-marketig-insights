import type { IngeridoRepository } from '@domain/ingeridos/IngeridoRepository';
import type { ToastDto } from './dto';

export const DRIVER_REMOVIDO = '⚠️ Driver removido.';

export class DeleteIngerido {
  constructor(private readonly repository: IngeridoRepository) {}

  async execute(id: string): Promise<ToastDto> {
    await this.repository.delete(id);
    return { toast: DRIVER_REMOVIDO };
  }
}
