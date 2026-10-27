import type { AgenteRepository } from '@domain/agentes/AgenteRepository';
import { alertaAgentes, proximaExecucao, resumoAgentes } from '@domain/agentes/agenteRules';
import type { AgenteAgendadoDto, AgentesResumoDto } from './dto';

export function montarAgentesResumo(
  total: number,
  ativos: number,
  agendados: readonly AgenteAgendadoDto[],
): AgentesResumoDto {
  const proxima = proximaExecucao(agendados.map((agente) => ({ ...agente, ativo: true })));
  return {
    total,
    ativos,
    agendados: [...agendados],
    proxima,
    alertaTexto: alertaAgentes(total, ativos, proxima),
    resumoTexto: resumoAgentes(total, ativos),
  };
}

export class GetAgentesResumo {
  constructor(private readonly repository: AgenteRepository) {}

  async execute(): Promise<AgentesResumoDto> {
    const [todos, ativos] = await Promise.all([
      this.repository.listPage({ page: 1, size: 1 }),
      this.repository.listAtivos(),
    ]);
    const agendados = ativos.items
      .filter((agente) => agente.ativo)
      .map(({ id, papel, schedule }) => ({ id, papel, schedule }));
    return montarAgentesResumo(todos.total, ativos.total, agendados);
  }
}
