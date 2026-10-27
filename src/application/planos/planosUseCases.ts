import type { AtualizarPlanoItem } from './AtualizarPlanoItem';
import type { ContarPlanoItens } from './ContarPlanoItens';
import type { ExcluirPlanoItem } from './ExcluirPlanoItem';
import type { GetPlanoItem } from './GetPlanoItem';
import type { IncluirPlanoItem } from './IncluirPlanoItem';
import type { ListPlanoItens } from './ListPlanoItens';
import type { ListSkusInclusao } from './ListSkusInclusao';
import type { ResumirPlano } from './ResumirPlano';

export interface PlanosUseCases {
  list: Pick<ListPlanoItens, 'execute'>;
  contar: Pick<ContarPlanoItens, 'execute'>;
  get: Pick<GetPlanoItem, 'execute'>;
  skusInclusao: Pick<ListSkusInclusao, 'execute'>;
  incluir: Pick<IncluirPlanoItem, 'execute'>;
  atualizar: Pick<AtualizarPlanoItem, 'execute'>;
  excluir: Pick<ExcluirPlanoItem, 'execute'>;
  resumo: Pick<ResumirPlano, 'execute'>;
}
