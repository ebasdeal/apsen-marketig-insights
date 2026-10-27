import type { AgenteRepository } from '@domain/agentes/AgenteRepository';
import { toggleToast } from './agenteToasts';
import type { AgenteToastDto, ToggleAgenteInput } from './dto';

export class ToggleAgente {
  constructor(private readonly repository: AgenteRepository) {}

  async execute({ id, papel, ativo }: ToggleAgenteInput): Promise<AgenteToastDto> {
    await this.repository.update(id, { ativo });
    return { toast: toggleToast(papel, ativo) };
  }
}
