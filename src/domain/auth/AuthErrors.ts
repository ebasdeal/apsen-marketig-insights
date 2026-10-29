import { DomainError } from '../shared/DomainError';

export class CodigoInvalidoError extends DomainError {
  constructor() {
    super('Não foi possível concluir o login. Tente novamente.');
  }
}

export class UsuarioNaoCadastradoError extends DomainError {
  constructor() {
    super(
      'Seu acesso ao Demand Intelligence ainda não foi liberado. Solicite o cadastro ao administrador.',
    );
  }
}

export class SomenteLeituraError extends DomainError {
  constructor() {
    super('⚠️ Seu usuário está inativo: o acesso é somente para visualização.');
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
  CodigoInvalidoError | UsuarioNaoCadastradoError | SessaoExpiradaError | SsoNaoConfiguradoError;

export function isAuthError(error: unknown): error is AuthError {
  return (
    error instanceof CodigoInvalidoError ||
    error instanceof UsuarioNaoCadastradoError ||
    error instanceof SessaoExpiradaError ||
    error instanceof SsoNaoConfiguradoError
  );
}
