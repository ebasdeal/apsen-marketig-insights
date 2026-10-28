import { DomainError } from '../../shared/DomainError';
import {
  CodigoInvalidoError,
  SessaoExpiradaError,
  SsoNaoConfiguradoError,
  UsuarioNaoCadastradoError,
  isAuthError,
} from '../AuthErrors';

describe('erros de autenticação', () => {
  it.each([
    [new CodigoInvalidoError(), 'Não foi possível concluir o login. Tente novamente.'],
    [
      new UsuarioNaoCadastradoError(),
      'Seu acesso ao Demand Intelligence ainda não foi liberado. Solicite o cadastro ao administrador.',
    ],
    [new SessaoExpiradaError(), 'Sua sessão expirou. Entre novamente.'],
    [
      new SsoNaoConfiguradoError(),
      'Login Microsoft ainda não configurado (App Registration do Entra ID pendente).',
    ],
  ])('%s tem a mensagem esperada', (error, message) => {
    expect(error).toBeInstanceOf(DomainError);
    expect(error.message).toBe(message);
    expect(isAuthError(error)).toBe(true);
  });

  it('isAuthError rejeita outros erros', () => {
    expect(isAuthError(new Error('x'))).toBe(false);
  });
});
