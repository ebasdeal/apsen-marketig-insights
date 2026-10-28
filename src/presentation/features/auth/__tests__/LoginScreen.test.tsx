import { SsoNaoConfiguradoError } from '@domain/auth/AuthErrors';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { loginAs, logout } from '@test/resetStores';
import { screen, waitFor } from '@testing-library/react';
import { INITIAL_SESSAO_STATE, useSessaoStore } from '../../../stores/sessaoStore';
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen', () => {
  beforeEach(() => logout());

  it('mostra o ambiente, o título e o suporte sem link quando não há URL', () => {
    renderWithProviders(<LoginScreen ambiente="Homologação" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Demand Intelligence' })).toBeVisible();
    expect(screen.getByText('Seja bem-vindo!')).toBeVisible();
    expect(screen.getByText('Vamos começar?')).toBeVisible();
    expect(screen.getByText('Homologação').tagName).toBe('STRONG');
    expect(screen.getByRole('img', { name: 'Apsen' })).toHaveClass('brightness-0', 'invert');
    expect(screen.queryByRole('link', { name: 'Service-now' })).not.toBeInTheDocument();
    expect(screen.getByText(/Entre em contato através do Service-now\./)).toBeInTheDocument();
  });

  it('com URL de suporte o Service-now vira link externo', () => {
    renderWithProviders(
      <LoginScreen ambiente="Produção" suporteUrl="https://suporte.exemplo.com" />,
    );
    expect(screen.getByRole('link', { name: 'Service-now' })).toHaveAttribute(
      'href',
      'https://suporte.exemplo.com',
    );
  });

  it('o botão inicia o SSO preservando o retorno', async () => {
    navigationState.search = 'retorno=%2Fdrivers%3Fpage%3D2';
    const useCases = createFakeUseCases();
    const { user } = renderWithProviders(<LoginScreen ambiente="Desenvolvimento" />, useCases);
    await user.click(screen.getByRole('button', { name: /Entrar com e-mail corporativo/ }));
    expect(useCases.auth.iniciarLogin.execute).toHaveBeenCalledWith('/drivers?page=2');
    expect(screen.getByRole('button', { name: /Redirecionando/ })).toBeDisabled();
  });

  it('ignora retorno externo e usa a raiz', async () => {
    navigationState.search = 'retorno=%2F%2Fevil.com';
    const useCases = createFakeUseCases();
    const { user } = renderWithProviders(<LoginScreen ambiente="Desenvolvimento" />, useCases);
    await user.click(screen.getByRole('button', { name: /Entrar com e-mail corporativo/ }));
    expect(useCases.auth.iniciarLogin.execute).toHaveBeenCalledWith('/');
  });

  it('mostra o erro quando o SSO não está configurado e permite tentar de novo', async () => {
    const execute = vi.fn(() => {
      throw new SsoNaoConfiguradoError();
    });
    const { user } = renderWithProviders(
      <LoginScreen ambiente="Produção" />,
      createFakeUseCases({ auth: { iniciarLogin: { execute } } }),
    );
    await user.click(screen.getByRole('button', { name: /Entrar com e-mail corporativo/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Login Microsoft ainda não');
    await user.click(screen.getByRole('button', { name: /Entrar com e-mail corporativo/ }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
  });

  it('com sessão ativa redireciona ao retorno (ou à raiz)', async () => {
    navigationState.search = 'retorno=%2Fdrivers';
    loginAs('admin');
    renderWithProviders(<LoginScreen ambiente="Desenvolvimento" />);
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/drivers'));
    expect(screen.getByRole('status')).toHaveTextContent('Verificando sua sessão…');
  });

  it('com sessão ativa e sem retorno vai para a raiz', async () => {
    loginAs('admin');
    renderWithProviders(<LoginScreen ambiente="Desenvolvimento" />);
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/'));
  });

  it('aguarda a reidratação antes de decidir', () => {
    vi.spyOn(useSessaoStore.persist, 'rehydrate').mockResolvedValue(undefined);
    useSessaoStore.setState(INITIAL_SESSAO_STATE);
    renderWithProviders(<LoginScreen ambiente="Desenvolvimento" />);
    expect(screen.getByRole('status')).toHaveTextContent('Verificando sua sessão…');
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
