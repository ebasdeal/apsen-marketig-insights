import type { AgentesUseCases } from '@application/agentes/agentesUseCases';
import { GetAgenteForm } from '@application/agentes/GetAgenteForm';
import { GetAgentesResumo } from '@application/agentes/GetAgentesResumo';
import { ListAgentes } from '@application/agentes/ListAgentes';
import { SaveAgente } from '@application/agentes/SaveAgente';
import { TestarAgente } from '@application/agentes/TestarAgente';
import { ToggleAgente } from '@application/agentes/ToggleAgente';
import { HttpAgenteRepository } from '@infrastructure/agentes/HttpAgenteRepository';
import type { HttpClient } from '@infrastructure/http/HttpClient';

export interface AgentesModuleOptions {
  now?: () => Date;
  newId?: () => string;
}

export function createAgentesModule(
  http: HttpClient,
  { now = () => new Date(), newId = () => crypto.randomUUID() }: AgentesModuleOptions = {},
): AgentesUseCases {
  const repository = new HttpAgenteRepository(http);
  return {
    list: new ListAgentes(repository),
    resumo: new GetAgentesResumo(repository),
    getForm: new GetAgenteForm(repository),
    save: new SaveAgente(repository, newId),
    toggle: new ToggleAgente(repository),
    testar: new TestarAgente(repository, now),
  };
}
