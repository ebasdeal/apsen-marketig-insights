import { CodigoInvalidoError } from '@domain/auth/AuthErrors';
import type { AuthRepository } from '@domain/auth/AuthRepository';
import type { Sessao, UsuarioSessao } from '@domain/auth/Sessao';
import type { SsoProvider } from '@domain/auth/SsoProvider';

export class ConcluirLogin {
  constructor(private readonly repository: AuthRepository) {}

  async execute(code: string | null): Promise<Sessao> {
    const valor = code?.trim() ?? '';
    if (valor === '') {
      throw new CodigoInvalidoError();
    }
    return this.repository.trocarCodigo(valor);
  }
}

export class ObterSessaoAtual {
  constructor(private readonly repository: AuthRepository) {}

  execute(): Promise<UsuarioSessao> {
    return this.repository.me();
  }
}

export class Sair {
  constructor(private readonly repository: AuthRepository) {}

  execute(): Promise<void> {
    return this.repository.logout();
  }
}

export class IniciarLogin {
  constructor(private readonly provider: SsoProvider) {}

  execute(state: string): void {
    this.provider.redirecionarParaLogin(state);
  }
}

export class EncerrarNoProvedor {
  constructor(private readonly provider: SsoProvider) {}

  execute(): void {
    this.provider.redirecionarParaLogout();
  }
}
