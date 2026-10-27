import { DomainError } from '../shared/DomainError';

export type RejeicaoCampo = 'motivo' | 'justificativa';

export type RejeicaoErrors = Partial<Record<RejeicaoCampo, string>>;

export class RejeicaoValidationError extends DomainError {
  constructor(
    readonly errors: RejeicaoErrors,
    message: string,
  ) {
    super(message);
  }
}

export const EM_USO_MENSAGEM = 'Driver em uso no Data Lake — não pode alterar';

export class AprovacaoEmUsoError extends DomainError {
  constructor() {
    super(EM_USO_MENSAGEM);
  }
}
