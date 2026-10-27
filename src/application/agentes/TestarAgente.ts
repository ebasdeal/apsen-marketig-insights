import type { UltimoTeste } from '@domain/agentes/Agente';
import type { AgenteRepository } from '@domain/agentes/AgenteRepository';
import { formatTs } from '@domain/agentes/agenteRules';
import { conexaoOkToast } from './agenteToasts';
import type { TestarAgenteDto, TestarAgenteInput } from './dto';

export class TestarAgente {
  constructor(
    private readonly repository: AgenteRepository,
    private readonly now: () => Date,
  ) {}

  async execute({ id, papel }: TestarAgenteInput): Promise<TestarAgenteDto> {
    const ultimoTeste: UltimoTeste = { status: 'ok', ts: formatTs(this.now()) };
    await this.repository.update(id, { ultimoTeste });
    return { toast: conexaoOkToast(papel), ultimoTeste };
  }
}
