export interface SsoProvider {
  redirecionarParaLogin(state: string): void;
  redirecionarParaLogout(): void;
}
