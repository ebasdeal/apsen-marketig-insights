import { navigationState } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { loginAs } from '@test/resetStores';
import { NavProvider } from '../NavContext';
import { Topbar } from '../Topbar';

function renderTopbar(useCases = createFakeUseCases()) {
  return renderWithProviders(
    <NavProvider>
      <Topbar />
    </NavProvider>,
    useCases,
  );
}

describe('Topbar', () => {
  it.each([
    ['/', 'Dashboard'],
    ['/admin/aprovacoes', 'Fila de Aprovação'],
    ['/drivers/catalogo/X', 'Drivers da Família'],
    ['/xyz', 'Página não encontrada'],
  ])('mostra a trilha Demand Intelligence › crumb para %s', async (pathname, crumb) => {
    navigationState.pathname = pathname;
    renderTopbar();
    const trail = screen.getByRole('navigation', { name: 'Trilha' });
    expect(within(trail).getByText('Demand Intelligence')).toBeInTheDocument();
    expect(within(trail).getByText(crumb)).toHaveClass('font-medium', 'text-apsen-slate');
    expect(within(trail).getByText(crumb)).toHaveAttribute('aria-current', 'page');
    await screen.findByText('Ana Admin');
  });

  it('mostra "Acesso Negado" quando a guarda bloqueia', async () => {
    loginAs('viewer');
    navigationState.pathname = '/admin/ciclos';
    renderTopbar();
    expect(await screen.findByText('Acesso Negado')).toBeInTheDocument();
  });

  it('renderiza avatar e nome do Admin', async () => {
    renderTopbar();
    expect(await screen.findByText('Ana Admin')).toHaveClass('max-[560px]:hidden', 'font-semibold');
    const avatar = screen.getByTestId('topbar-avatar');
    expect(avatar).toHaveTextContent('A');
    expect(avatar).toHaveClass('size-[30px]', 'rounded-full', 'bg-apsen-purple', 'text-white');
    expect(screen.getByRole('button', { name: 'Alternar tema' })).toBeInTheDocument();
  });

  it('usa a cor muted para o Visualizador', async () => {
    loginAs('viewer');
    renderTopbar();
    expect(await screen.findByText('Pedro Viewer')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-avatar')).toHaveTextContent('P');
    expect(screen.getByTestId('topbar-avatar')).toHaveClass('bg-apsen-avatar-muted');
  });

  it('não mostra avatar enquanto os perfis carregam', () => {
    const useCases = createFakeUseCases({
      perfis: { list: { execute: () => new Promise(() => undefined) } },
    });
    renderTopbar(useCases);
    expect(screen.queryByTestId('topbar-avatar')).not.toBeInTheDocument();
  });

  it('alterna o menu pelo burger e desliza a topbar', async () => {
    const { user } = renderTopbar();
    const burger = screen.getByRole('button', { name: 'Alternar menu' });
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('top-0', 'motion-reduce:transition-none');
    expect(burger).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveClass('left-sidebar');
    await user.click(burger);
    expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveClass('left-0');
    expect(header).not.toHaveClass('left-sidebar');
  });
});
