import type { AtualizarRestricao } from './AtualizarRestricao';
import type { ContarRestricoes } from './ContarRestricoes';
import type { ListRestricoes } from './ListRestricoes';
import type { RegistrarRestricao } from './RegistrarRestricao';
import type { ResolverRestricao } from './ResolverRestricao';
import type { ResumirRestricoes } from './ResumirRestricoes';

export interface RestricoesUseCases {
  list: Pick<ListRestricoes, 'execute'>;
  contar: Pick<ContarRestricoes, 'execute'>;
  registrar: Pick<RegistrarRestricao, 'execute'>;
  atualizar: Pick<AtualizarRestricao, 'execute'>;
  resolver: Pick<ResolverRestricao, 'execute'>;
  resumo: Pick<ResumirRestricoes, 'execute'>;
}
