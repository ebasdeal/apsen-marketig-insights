import type { FonteRepository } from '@domain/fontes/FonteRepository';
import { FonteProtegidaError } from '@domain/fontes/errors';
import type { FonteToastResult } from './dto';

export const FONTE_REMOVIDA = 'Fonte removida.';

export interface DeleteFonteInput {
  id: string;
  removivel: boolean;
}

export class DeleteFonte {
  constructor(private readonly repository: FonteRepository) {}

  async execute({ id, removivel }: DeleteFonteInput): Promise<FonteToastResult> {
    if (!removivel) {
      throw new FonteProtegidaError(id);
    }
    await this.repository.delete(id);
    return { toast: FONTE_REMOVIDA };
  }
}
