import type { GetAgenteForm } from './GetAgenteForm';
import type { GetAgentesResumo } from './GetAgentesResumo';
import type { ListAgentes } from './ListAgentes';
import type { SaveAgente } from './SaveAgente';
import type { TestarAgente } from './TestarAgente';
import type { ToggleAgente } from './ToggleAgente';

export interface AgentesUseCases {
  list: Pick<ListAgentes, 'execute'>;
  resumo: Pick<GetAgentesResumo, 'execute'>;
  getForm: Pick<GetAgenteForm, 'execute'>;
  save: Pick<SaveAgente, 'execute'>;
  toggle: Pick<ToggleAgente, 'execute'>;
  testar: Pick<TestarAgente, 'execute'>;
}
