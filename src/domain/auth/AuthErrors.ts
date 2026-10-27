import { DomainError } from '../shared/DomainError';

export class CodigoInvalidoError extends DomainError {
  constructor() {
    super('Não foi possível concluir o login. Tente novamente.');
  }
}

export class UsuarioInativoError extends DomainError {
  constructor() {
    super('Usuário inativo. Fale com o administrador do sistema.');
  }
}

export class SessaoExpiradaError extends DomainError {
  constructor() {
    super('Sua sessão expirou. Entre novamente.');
  }
}

export class SsoNaoConfiguradoError extends DomainError {
  constructor() {
    super('Login Microsoft ainda não configurado (App Registration do Entra ID pendente).');
  }
}

export type AuthError =
  CodigoInvalidoError | UsuarioInativoError | SessaoExpiradaError | SsoNaoConfiguradoError;

export function isAuthError(error: unknown): error is AuthError {
  return (
    error instanceof CodigoInvalidoError ||
    error instanceof UsuarioInativoError ||
    error instanceof SessaoExpiradaError ||
    error instanceof SsoNaoConfiguradoError
  );
}
