import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { logout } from '@test/resetStores';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useSessaoStore } from '../../../stores/sessaoStore';
import { initialOf, UserMenu } from '../UserMenu';

async function openMenu() {
  const result = renderWithProviders(
    <>
      <UserMenu />
      <p>fora</p>
    </>,
  );
  const trigger = await screen.findByRole('button', { name: 'Menu do usuário Ana Admin' });
  return { ...result, trigger };
}

describe('initialOf', () => {
  it('usa a inicial do nome do usuário, não a letra fixa do perfil', () => {
    expect(initialOf('marcus Cruz', 'P')).toBe('M');
    expect(initialOf('  Érica Lima', 'P')).toBe('É');
  });

  it('cai na letra do perfil quando o nome está vazio', () => {
    expect(initialOf('   ', 'P')).toBe('P');
  });
});

describe('UserMenu', () => {
  it('mostra avatar e nome; abre com nome, e-mail, perfil e Sair', async () => {
    const { user, trigger } = await openMenu();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('topbar-avatar')).toHaveTextContent('A');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu', { name: 'Conta' });
    expect(trigger).toHaveAttribute('aria-controls', menu.id);
    expect(within(menu).getByText('ana.admin@apsen.com.br')).toBeInTheDocument();
    expect(within(menu).getByText('Perfil: Admin')).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
  });

  it('Esc fecha e devolve o foco; setas navegam', async () => {
    const { user, trigger } = await openMenu();
    await user.click(trigger);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    await user.keyboard('a');
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('clicar fora fecha; clicar de novo no botão alterna', async () => {
    const { user, trigger } = await openMenu();
    await user.click(trigger);
    fireEvent.pointerDown(screen.getByRole('menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(screen.getByText('fora'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Sair chama o logout, limpa sessão e cache e vai ao logout do provedor', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('rede'));
    const useCases = createFakeUseCases({ auth: { sair: { execute } } });
    const result = renderWithProviders(<UserMenu />, useCases);
    const trigger = await screen.findByRole('button', { name: 'Menu do usuário Ana Admin' });
    await result.user.click(trigger);
    await result.user.click(screen.getByRole('menuitem', { name: 'Sair' }));
    await waitFor(() => expect(useCases.auth.encerrarNoProvedor.execute).toHaveBeenCalledTimes(1));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(useSessaoStore.getState()).toMatchObject({ sessao: null, saindo: true });
    expect(
      result.queryClient
        .getQueryCache()
        .getAll()
        .every((query) => query.state.data === undefined),
    ).toBe(true);
  });

  it('logout do provedor indisponível não quebra o menu', async () => {
    const useCases = createFakeUseCases({
      auth: {
        encerrarNoProvedor: {
          execute: vi.fn(() => {
            throw new Error('não configurado');
          }),
        },
      },
    });
    const result = renderWithProviders(<UserMenu />, useCases);
    await result.user.click(await screen.findByRole('button', { name: /Menu do usuário/ }));
    await result.user.click(screen.getByRole('menuitem', { name: 'Sair' }));
    await waitFor(() => expect(useSessaoStore.getState().sessao).toBeNull());
    expect(useSessaoStore.getState().saindo).toBe(false);
  });

  it('sem sessão não renderiza', () => {
    logout();
    renderWithProviders(<UserMenu />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
