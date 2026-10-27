import { DomainError } from '../shared/DomainError';
import type { FonteErrors } from './Fonte';
import { firstFonteError } from './fonteRules';

export class FonteValidationError extends DomainError {
  constructor(readonly errors: FonteErrors) {
    super(firstFonteError(errors) ?? 'Fonte inválida.');
  }
}

export class FonteProtegidaError extends DomainError {
  constructor(readonly fonteId: string) {
    super('Fonte do sistema não pode ser removida.');
  }
}
