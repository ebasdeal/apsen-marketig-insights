import { CodigoInvalidoError } from '@domain/auth/AuthErrors';
import type { AuthRepository } from '@domain/auth/AuthRepository';
import { SESSAO_ADMIN } from '@test/fixtures/sessao';
import {
  ConcluirLogin,
  EncerrarNoProvedor,
  IniciarLogin,
  ObterSessaoAtual,
  Sair,
} from '../authUseCases';

function fakeRepository() {
  return {
    trocarCodigo: vi.fn().mockResolvedValue(SESSAO_ADMIN),
    me: vi.fn().mockResolvedValue(SESSAO_ADMIN.usuario),
    logout: vi.fn().mockResolvedValue(undefined),
  } satisfies AuthRepository;
}

describe('ConcluirLogin', () => {
  it('troca o código pela sessão', async () => {
    const repository = fakeRepository();
    await expect(new ConcluirLogin(repository).execute(' abc ')).resolves.toEqual(SESSAO_ADMIN);
    expect(repository.trocarCodigo).toHaveBeenCalledWith('abc');
  });

  it.each([null, '', '  '])('código %p é inválido sem chamar a API', async (code) => {
    const repository = fakeRepository();
    await expect(new ConcluirLogin(repository).execute(code)).rejects.toBeInstanceOf(
      CodigoInvalidoError,
    );
    expect(repository.trocarCodigo).not.toHaveBeenCalled();
  });
});

describe('ObterSessaoAtual e Sair', () => {
  it('consultam e encerram a sessão', async () => {
    const repository = fakeRepository();
    await expect(new ObterSessaoAtual(repository).execute()).resolves.toEqual(SESSAO_ADMIN.usuario);
    await expect(new Sair(repository).execute()).resolves.toBeUndefined();
    expect(repository.logout).toHaveBeenCalledTimes(1);
  });
});

describe('IniciarLogin e EncerrarNoProvedor', () => {
  it('delegam ao provedor de identidade', () => {
    const provider = { redirecionarParaLogin: vi.fn(), redirecionarParaLogout: vi.fn() };
    new IniciarLogin(provider).execute('/drivers?q=x');
    new EncerrarNoProvedor(provider).execute();
    expect(provider.redirecionarParaLogin).toHaveBeenCalledWith('/drivers?q=x');
    expect(provider.redirecionarParaLogout).toHaveBeenCalledTimes(1);
  });
});
