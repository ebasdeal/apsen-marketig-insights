import { SsoNaoConfiguradoError } from '@domain/auth/AuthErrors';
import { SESSOES } from '@test/fixtures/sessao';
import { navigationState } from '@test/nextNavigation';
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
  it('sem sessão redireciona ao provedor de identidade com a rota atual como state', async () => {
    logout();
    navigationState.pathname = '/drivers';
    const { useCases } = renderGate();
    await waitFor(() =>
      expect(useCases.auth.iniciarLogin.execute).toHaveBeenCalledWith('/drivers'),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Redirecionando para o login…');
    expect(screen.queryByText('área logada')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Senha')).not.toBeInTheDocument();
  });

  it('preserva a query da rota no state', async () => {
    logout();
    navigationState.pathname = '/drivers';
    window.history.pushState({}, '', '/drivers?page=2');
    const { useCases } = renderGate();
    await waitFor(() =>
      expect(useCases.auth.iniciarLogin.execute).toHaveBeenCalledWith('/drivers?page=2'),
    );
    window.history.pushState({}, '', '/');
  });

  it('modo entra sem App Registration mostra o ErrorState e permite tentar de novo', async () => {
    logout();
    const execute = vi.fn(() => {
      throw new SsoNaoConfiguradoError();
    });
    const { user } = renderGate(createFakeUseCases({ auth: { iniciarLogin: { execute } } }));
    expect(
      await screen.findByRole('heading', {
        name: 'Login Microsoft ainda não configurado (App Registration do Entra ID pendente).',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
  });

  it('aguarda a reidratação antes de decidir', () => {
    useSessaoStore.setState(INITIAL_SESSAO_STATE);
    const { useCases } = renderGate();
    expect(useCases.auth.iniciarLogin.execute).not.toHaveBeenCalled();
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

  it('401 numa lista expira a sessão e volta ao provedor com a rota atual', async () => {
    navigationState.pathname = '/admin/ciclos';
    const { useCases } = renderGate();
    expect(await screen.findByText('área logada')).toBeInTheDocument();
    act(() => useSessaoStore.getState().expirar());
    await waitFor(() =>
      expect(useCases.auth.iniciarLogin.execute).toHaveBeenCalledWith('/admin/ciclos'),
    );
    expect(screen.queryByText('área logada')).not.toBeInTheDocument();
  });

  it('ao sair não reinicia o login: espera o logout do provedor', async () => {
    const { useCases } = renderGate();
    expect(await screen.findByText('área logada')).toBeInTheDocument();
    act(() => useSessaoStore.getState().encerrar());
    expect(screen.getByRole('status')).toHaveTextContent('Saindo…');
    await act(async () => {
      await Promise.resolve();
    });
    expect(useCases.auth.iniciarLogin.execute).not.toHaveBeenCalled();
    act(() => useSessaoStore.getState().cancelarSaida());
    await waitFor(() => expect(useCases.auth.iniciarLogin.execute).toHaveBeenCalled());
  });
});
