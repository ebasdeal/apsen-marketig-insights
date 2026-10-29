import { DomainError } from '../shared/DomainError';

export type RestricaoCampo = 'tipo' | 'desc';

export class RestricaoInvalidaError extends DomainError {
  constructor(
    message: string,
    readonly campo: RestricaoCampo,
  ) {
    super(message);
  }
}
