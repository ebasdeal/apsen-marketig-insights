import { SESSOES } from '@test/fixtures/sessao';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { act, screen, waitFor } from '@testing-library/react';
import { INITIAL_SESSAO_STATE, useSessaoStore } from '../../../stores/sessaoStore';
import { AuthGate } from '../AuthGate';

function renderGate(useCases = createFakeUseCases()) {
  const result = renderWithProviders(
    <AuthGate>
      <p>área logada</p>
    </AuthGate>,
    useCases,
  );
  return { ...result, useCases };
}

describe('AuthGate', () => {
  it('sem sessão manda para /entrar com a rota atual em retorno', async () => {
    logout();
    navigationState.pathname = '/drivers';
    const { useCases } = renderGate();
    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith('/entrar?retorno=%2Fdrivers'),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Redirecionando para o login…');
    expect(screen.queryByText('área logada')).not.toBeInTheDocument();
    expect(useCases.auth.iniciarLogin.execute).not.toHaveBeenCalled();
  });

  it('preserva a query da rota no retorno', async () => {
    logout();
    navigationState.pathname = '/drivers';
    window.history.pushState({}, '', '/drivers?page=2');
    renderGate();
    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith(
        `/entrar?retorno=${encodeURIComponent('/drivers?page=2')}`,
      ),
    );
    window.history.pushState({}, '', '/');
  });

  it('aguarda a reidratação antes de decidir', () => {
    vi.spyOn(useSessaoStore.persist, 'rehydrate').mockResolvedValue(undefined);
    useSessaoStore.setState(INITIAL_SESSAO_STATE);
    renderGate();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('valida /auth/me e mostra o conteúdo', async () => {
    const execute = vi.fn().mockResolvedValue({ ...SESSOES.admin.usuario, nome: 'Ana Atual' });
    renderGate(createFakeUseCases({ auth: { sessaoAtual: { execute } } }));
    expect(screen.getByText('área logada')).toBeInTheDocument();
    await waitFor(() => expect(useSessaoStore.getState().sessao?.usuario.nome).toBe('Ana Atual'));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(useSessaoStore.getState().sessao?.usuario.nome).toBe('Ana Atual');
  });

  it('erro de rede mostra ErrorState com nova tentativa', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValue(SESSOES.admin.usuario);
    const { user } = renderGate(createFakeUseCases({ auth: { sessaoAtual: { execute } } }));
    expect(
      await screen.findByRole('heading', { name: 'Não foi possível validar a sessão' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('área logada')).toBeInTheDocument();
  });

  it('401 numa lista expira a sessão e volta ao /entrar com a rota atual', async () => {
    navigationState.pathname = '/admin/ciclos';
    renderGate();
    expect(await screen.findByText('área logada')).toBeInTheDocument();
    act(() => useSessaoStore.getState().expirar());
    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith('/entrar?retorno=%2Fadmin%2Fciclos'),
    );
    expect(screen.queryByText('área logada')).not.toBeInTheDocument();
  });

  it('ao sair não vai ao login: espera o logout do provedor', async () => {
    renderGate();
    expect(await screen.findByText('área logada')).toBeInTheDocument();
    act(() => useSessaoStore.getState().encerrar());
    expect(screen.getByRole('status')).toHaveTextContent('Saindo…');
    await act(async () => {
      await Promise.resolve();
    });
    expect(routerMock.replace).not.toHaveBeenCalled();
    act(() => useSessaoStore.getState().cancelarSaida());
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/entrar?retorno=%2F'));
  });
});
