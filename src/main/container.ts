import type { SsoProvider } from '@domain/auth/SsoProvider';
import { parseEnv, readProcessEnv, type AppEnv } from '@infrastructure/config/env';
import { FetchHttpClient, type FetchFn } from '@infrastructure/http/FetchHttpClient';
import type { UseCases } from '@presentation/providers/UseCasesContext';
import { expirarSessao, tokenAtual } from '@presentation/stores/sessaoStore';
import { createAuthModule, createSsoProvider } from './modules/auth';
import { createCatalogoModule } from './modules/catalogo';
import { createDriversModule } from './modules/drivers';
import { createNavegacaoModule } from './modules/navegacao';
import { createPerfisModule } from './modules/perfis';

export interface Container {
  useCases: UseCases;
}

export interface ContainerOverrides {
  fetchFn?: FetchFn;
  timeoutMs?: number;
  sso?: SsoProvider;
  getToken?: () => string | undefined;
  onUnauthorized?: () => void;
}

export function createContainer(env: AppEnv, overrides: ContainerOverrides = {}): Container {
  const { sso = createSsoProvider(env), ...httpOverrides } = overrides;
  const http = new FetchHttpClient({
    baseUrl: env.apiUrl,
    getToken: tokenAtual,
    onUnauthorized: expirarSessao,
    ...httpOverrides,
  });
  return {
    useCases: {
      auth: createAuthModule(http, sso),
      perfis: createPerfisModule(http),
      navegacao: createNavegacaoModule(http),
      drivers: createDriversModule(http),
      catalogo: createCatalogoModule(http),
    },
  };
}

export function createContainerFromProcessEnv(): Container {
  return createContainer(parseEnv(readProcessEnv()));
}
