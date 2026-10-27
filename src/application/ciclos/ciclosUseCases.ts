import type { GetCiclosResumo } from './GetCiclosResumo';
import type { ListCiclos } from './ListCiclos';
import type { SaveCiclo } from './SaveCiclo';
import type { ToggleCiclo } from './ToggleCiclo';

export interface CiclosUseCases {
  list: Pick<ListCiclos, 'execute'>;
  resumo: Pick<GetCiclosResumo, 'execute'>;
  save: Pick<SaveCiclo, 'execute'>;
  toggle: Pick<ToggleCiclo, 'execute'>;
}
