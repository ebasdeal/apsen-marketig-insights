import type { SsoProvider } from '@domain/auth/SsoProvider';
import { parseEnv, readProcessEnv, type AppEnv } from '@infrastructure/config/env';
import { FetchHttpClient, type FetchFn } from '@infrastructure/http/FetchHttpClient';
import type { UseCases } from '@presentation/providers/UseCasesContext';
import { expirarSessao, tokenAtual } from '@presentation/stores/sessaoStore';
import { createAnalisesModule } from './modules/analises';
import { createAuthModule, createSsoProvider } from './modules/auth';
import { createCiclosModule } from './modules/ciclos';
import { createFontesModule } from './modules/fontes';
import { createNavegacaoModule } from './modules/navegacao';
import { createPerfisModule } from './modules/perfis';
import { createPlanosModule } from './modules/planos';
import { createRestricoesModule } from './modules/restricoes';

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
      analises: createAnalisesModule(http),
      ciclos: createCiclosModule(http),
      fontes: createFontesModule(http),
      restricoes: createRestricoesModule(http),
      planos: createPlanosModule(http),
    },
  };
}

export function createContainerFromProcessEnv(): Container {
  return createContainer(parseEnv(readProcessEnv()));
}
