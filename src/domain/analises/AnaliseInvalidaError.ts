import { DomainError } from '../shared/DomainError';

export type CampoAnalise = 'titulo' | 'ciclo' | 'skus' | 'horizonte';

export class AnaliseInvalidaError extends DomainError {
  constructor(
    message: string,
    readonly campo?: CampoAnalise,
  ) {
    super(message);
  }
}
