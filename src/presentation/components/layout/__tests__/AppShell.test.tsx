import { navigationState } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { loginAs, logout } from '@test/resetStores';
import { screen } from '@testing-library/react';
import { useSessaoStore } from '../../../stores/sessaoStore';
import { AppShell } from '../AppShell';

function renderShell() {
  return renderWithProviders(
    <AppShell>
      <p>conteúdo da página</p>
    </AppShell>,
    // /auth/me devolve quem está logado na sessão do teste
    createFakeUseCases({
      auth: {
        sessaoAtual: {
          execute: vi.fn(async () => {
            const sessao = useSessaoStore.getState().sessao;
            if (sessao === null) {
              throw new Error('sem sessão');
            }
            return sessao.usuario;
          }),
        },
      },
    }),
  );
}

describe('AppShell', () => {
  it('renderiza sidebar, topbar, navegação e conteúdo sem role bar', async () => {
    navigationState.pathname = '/planos';
    renderShell();
    expect(screen.queryByText('Simular perfil:')).not.toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Menu lateral' })).toHaveClass(
      'top-0',
      'h-screen',
    );
    expect(screen.getByRole('banner')).toHaveClass('top-0');
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /PLP Ativo/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('main')).toHaveTextContent('conteúdo da página');
    expect(screen.getByRole('main')).toHaveClass(
      'mt-topbar',
      'h-[calc(100vh-var(--spacing-topbar))]',
      'motion-reduce:transition-none',
    );
    expect(await screen.findByText('Ana Admin')).toBeInTheDocument();
  });

  it('aplica a guarda dentro do main com o perfil da sessão', async () => {
    loginAs('viewer');
    navigationState.pathname = '/acesso/usuarios';
    renderShell();
    expect(await screen.findByRole('heading', { name: 'Acesso Restrito' })).toBeInTheDocument();
    expect(screen.queryByText('conteúdo da página')).not.toBeInTheDocument();
    expect(screen.getByText('Acesso Negado')).toBeInTheDocument();
  });

  it('Carlos (planejador) vê os módulos do nível 3 e é bloqueado em /agentes', async () => {
    loginAs('planejador');
    navigationState.pathname = '/agentes';
    renderShell();
    expect(await screen.findByRole('heading', { name: 'Acesso Restrito' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restrições & Alertas/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Controle de Acesso/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Usuários', hidden: true })).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Perfis de Acesso', hidden: true }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agentes de IA/ })).not.toBeInTheDocument();
  });

  it('Fernanda (área) é bloqueada em /admin/ciclos', async () => {
    loginAs('area');
    navigationState.pathname = '/admin/ciclos';
    renderShell();
    expect(await screen.findByRole('heading', { name: 'Acesso Restrito' })).toBeInTheDocument();
    expect(
      screen.getByText('Seu perfil (Área) não tem acesso a esta funcionalidade.'),
    ).toBeInTheDocument();
  });

  it('começa aberto no desktop e recolhe sidebar, topbar e main pelo burger', async () => {
    const { user } = renderShell();
    const sidebar = screen.getByRole('complementary', { name: 'Menu lateral' });
    const main = screen.getByRole('main');
    expect(sidebar).not.toHaveClass('-translate-x-full');
    expect(main).toHaveClass('ml-sidebar');
    await user.click(screen.getByRole('button', { name: 'Alternar menu' }));
    expect(sidebar).toHaveClass('-translate-x-full');
    expect(main).toHaveClass('ml-0');
    expect(main).not.toHaveClass('ml-sidebar');
  });

  it('zera o scroll do main ao trocar de rota', () => {
    const { rerender } = renderShell();
    const main = screen.getByRole('main');
    main.scrollTop = 120;
    navigationState.pathname = '/planos';
    rerender(
      <AppShell>
        <p>outra página</p>
      </AppShell>,
    );
    expect(main.scrollTop).toBe(0);
  });

  it('mantém sidebar e topbar mesmo sem sessão, com placeholders no lugar do perfil', () => {
    logout();
    renderShell();
    expect(screen.getByRole('complementary', { name: 'Menu lateral' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('nav-placeholder')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu-placeholder')).toBeInTheDocument();
    expect(screen.queryByText('conteúdo da página')).not.toBeInTheDocument();
  });
});
