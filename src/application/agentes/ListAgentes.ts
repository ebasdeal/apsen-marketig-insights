import type { Agente } from '@domain/agentes/Agente';
import type { AgenteRepository } from '@domain/agentes/AgenteRepository';
import { ambientePillLabel, ambienteTone, papelCurto } from '@domain/agentes/agenteRules';
import { AGENTE_PAGE_SIZE } from '@domain/agentes/vocabulario';
import { pageCountOf } from '@domain/shared/Page';
import type { AgenteRowDto, AgentesPageDto, ListAgentesInput } from './dto';

export function toAgenteRowDto(agente: Agente): AgenteRowDto {
  return {
    ...agente,
    ultimoTeste: { ...agente.ultimoTeste },
    papelCurto: papelCurto(agente.papel),
    ambienteLabel: ambientePillLabel(agente.ambiente),
    ambienteTone: ambienteTone(agente.ambiente),
  };
}

export class ListAgentes {
  constructor(private readonly repository: AgenteRepository) {}

  async execute({ page, size = AGENTE_PAGE_SIZE }: ListAgentesInput): Promise<AgentesPageDto> {
    const result = await this.repository.listPage({ page, size });
    return {
      rows: result.items.map(toAgenteRowDto),
      total: result.total,
      totalPages: pageCountOf(result.total, size),
    };
  }
}
