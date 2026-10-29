import { DomainError } from '../shared/DomainError';
import type { UsuarioErros } from './usuarioRules';

export class UsuarioValidationError extends DomainError {
  constructor(readonly erros: UsuarioErros) {
    super(Object.values(erros)[0] ?? 'Usuário inválido.');
  }
}

export class UsuarioProtegidoError extends DomainError {
  constructor() {
    super('Este usuário não pode ser removido.');
  }
}
