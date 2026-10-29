import {
  CodigoInvalidoError,
  SsoNaoConfiguradoError,
  UsuarioNaoCadastradoError,
} from '@domain/auth/AuthErrors';
import { SESSOES } from '@test/fixtures/sessao';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { useSessaoStore } from '../../../stores/sessaoStore';
import { AuthCallbackScreen } from '../AuthCallbackScreen';

function renderCallback(search: string, overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  navigationState.pathname = '/auth/callback';
  navigationState.search = search;
  const useCases = createFakeUseCases(overrides);
  const result = renderWithProviders(
    <StrictMode>
      <AuthCallbackScreen />
    </StrictMode>,
    useCases,
  );
  return { ...result, useCases };
}

describe('AuthCallbackScreen', () => {
  beforeEach(() => {
    logout();
  });

  it('troca o código uma única vez, grava a sessão e volta à rota pedida', async () => {
    const execute = vi.fn().mockResolvedValue(SESSOES.planejador);
    renderCallback('code=c-1&state=%2Fdrivers%3Fq%3Dx', { auth: { concluirLogin: { execute } } });
    expect(screen.getByRole('status')).toHaveTextContent('Entrando…');
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/drivers?q=x'));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledWith('c-1');
    expect(useSessaoStore.getState().sessao).toEqual(SESSOES.planejador);
    expect(screen.queryByRole('complementary', { name: 'Menu lateral' })).not.toBeInTheDocument();
  });

  it('state externo vai para /', async () => {
    renderCallback('code=c-1&state=%2F%2Fevil.com');
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/'));
  });

  it.each([
    [
      'code=x&state=%2Fplanos',
      new CodigoInvalidoError(),
      'Não foi possível concluir o login. Tente novamente.',
    ],
    [
      'code=x&state=%2Fplanos',
      new UsuarioNaoCadastradoError(),
      'Seu acesso ao Demand Intelligence ainda não foi liberado. Solicite o cadastro ao administrador.',
    ],
    [
      'code=x&state=%2Fplanos',
      new Error('rede'),
      'Não foi possível carregar os dados. Verifique se a API local está no ar e tente novamente.',
    ],
  ])(
    '%s com %s mostra a mensagem em tela cheia e reinicia o login',
    async (search, error, mensagem) => {
      const { user, useCases } = renderCallback(search, {
        auth: { concluirLogin: { execute: vi.fn().mockRejectedValue(error) } },
      });
      const heading = await screen.findByRole('heading', { name: mensagem });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      await waitFor(() => expect(heading).toHaveFocus());
      expect(heading).toHaveClass('outline-none');
      expect(screen.queryByRole('complementary', { name: 'Menu lateral' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
      expect(useCases.auth.iniciarLogin.execute).toHaveBeenCalledWith('/planos');
      expect(routerMock.replace).not.toHaveBeenCalled();
    },
  );

  it('sem code mostra o erro sem chamar a API real', async () => {
    const { useCases } = renderCallback('state=%2Fdrivers');
    expect(useCases.auth.concluirLogin.execute).toHaveBeenCalledWith(null);
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalled());
  });

  it('tentar novamente sem SSO configurado mostra o aviso', async () => {
    const { user } = renderCallback('', {
      auth: {
        concluirLogin: { execute: vi.fn().mockRejectedValue(new CodigoInvalidoError()) },
        iniciarLogin: {
          execute: vi.fn(() => {
            throw new SsoNaoConfiguradoError();
          }),
        },
      },
    });
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(
      screen.getByRole('heading', {
        name: 'Login Microsoft ainda não configurado (App Registration do Entra ID pendente).',
      }),
    ).toBeInTheDocument();
  });
});
