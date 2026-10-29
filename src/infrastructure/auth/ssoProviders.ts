import { SsoNaoConfiguradoError } from '@domain/auth/AuthErrors';
import type { SsoProvider } from '@domain/auth/SsoProvider';

export interface BrowserLocation {
  origin: string;
  assign(url: string): void;
}

export const CALLBACK_PATH = '/auth/callback';
export const LOGIN_PATH = '/entrar';

function browserLocation(): BrowserLocation {
  return window.location;
}

export class MockSsoProvider implements SsoProvider {
  constructor(
    private readonly apiUrl: string,
    private readonly location: () => BrowserLocation = browserLocation,
  ) {}

  redirecionarParaLogin(state: string): void {
    const location = this.location();
    const query = new URLSearchParams({
      redirect_uri: `${location.origin}${CALLBACK_PATH}`,
      state,
    });
    location.assign(`${this.apiUrl}/sso/authorize?${query.toString()}`);
  }

  redirecionarParaLogout(): void {
    const location = this.location();
    const query = new URLSearchParams({
      post_logout_redirect_uri: `${location.origin}${LOGIN_PATH}`,
    });
    location.assign(`${this.apiUrl}/sso/logout?${query.toString()}`);
  }
}

export class EntraSsoProvider implements SsoProvider {
  redirecionarParaLogin(_state: string): void {
    throw new SsoNaoConfiguradoError();
  }

  redirecionarParaLogout(): void {
    throw new SsoNaoConfiguradoError();
  }
}
