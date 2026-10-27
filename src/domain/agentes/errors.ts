import { DomainError } from '../shared/DomainError';
import type { AgenteErros } from './agenteRules';

export class AgenteValidationError extends DomainError {
  constructor(readonly erros: AgenteErros) {
    super(Object.values(erros)[0] ?? 'Agente inválido.');
  }
}
