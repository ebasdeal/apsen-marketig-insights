import { DomainError } from '../shared/DomainError';
import type { CicloErrors } from './Ciclo';
import { firstError } from './cicloRules';

export class CicloValidationError extends DomainError {
  constructor(readonly errors: CicloErrors) {
    super(firstError(errors) ?? 'Ciclo inválido.');
  }
}
