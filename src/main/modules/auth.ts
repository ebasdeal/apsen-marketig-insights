import {
  ConcluirLogin,
  EncerrarNoProvedor,
  IniciarLogin,
  ObterSessaoAtual,
  Sair,
} from '@application/auth/authUseCases';
import type { SsoProvider } from '@domain/auth/SsoProvider';
import { HttpAuthRepository } from '@infrastructure/auth/HttpAuthRepository';
import { EntraSsoProvider, MockSsoProvider } from '@infrastructure/auth/ssoProviders';
import type { AppEnv } from '@infrastructure/config/env';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import type { UseCases } from '@presentation/providers/UseCasesContext';

export function createSsoProvider(env: AppEnv): SsoProvider {
  return env.authMode === 'entra' ? new EntraSsoProvider() : new MockSsoProvider(env.apiUrl);
}

export function createAuthModule(http: HttpClient, sso: SsoProvider): UseCases['auth'] {
  const repository = new HttpAuthRepository(http);
  return {
    concluirLogin: new ConcluirLogin(repository),
    sessaoAtual: new ObterSessaoAtual(repository),
    sair: new Sair(repository),
    iniciarLogin: new IniciarLogin(sso),
    encerrarNoProvedor: new EncerrarNoProvedor(sso),
  };
}
