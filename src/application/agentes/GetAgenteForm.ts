import type { AgenteRepository } from '@domain/agentes/AgenteRepository';
import { ambienteDoSelect, modelosConhecidos, opcaoDoPapel } from '@domain/agentes/agenteRules';
import { AGENTE_SCHEDULES } from '@domain/agentes/vocabulario';
import type { AgenteFormDto } from './dto';

function extra(lista: readonly string[], atual: string): string | undefined {
  return atual.trim() === '' || lista.includes(atual) ? undefined : atual;
}

export class GetAgenteForm {
  constructor(private readonly repository: AgenteRepository) {}

  async execute(id: string): Promise<AgenteFormDto> {
    const agente = await this.repository.get(id);
    const schedule = extra(AGENTE_SCHEDULES, agente.schedule);
    const modelo = extra(modelosConhecidos(), agente.modelo);
    return {
      draft: {
        papelOpcao: opcaoDoPapel(agente.papel),
        nome: agente.nome,
        provedor: agente.provedor,
        ambiente: ambienteDoSelect(agente.ambiente),
        endpoint: agente.endpoint,
        vault: agente.vault,
        secret: agente.secret,
        modelo: agente.modelo,
        schedule: agente.schedule,
        fontes: agente.fontes,
        limiar: agente.limiar,
        ativo: agente.ativo,
      },
      extras: {
        ...(schedule === undefined ? {} : { schedule }),
        ...(modelo === undefined ? {} : { modelo }),
      },
    };
  }
}
