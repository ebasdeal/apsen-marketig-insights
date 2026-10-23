import { navigationState } from '@test/nextNavigation';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { NavProvider } from '../NavContext';
import { Topbar } from '../Topbar';

function renderTopbar() {
  return renderWithProviders(
    <NavProvider>
      <Topbar />
    </NavProvider>,
  );
}

describe('Topbar', () => {
  it.each([
    ['/', 'Dashboard'],
    ['/campaigns', 'Campanhas'],
    ['/campaigns/c-1', 'Detalhe da Campanha'],
    ['/nao-existe', 'Página não encontrada'],
  ])('mostra a trilha Marketing Insights › página para %s', (pathname, crumb) => {
    navigationState.pathname = pathname;
    renderTopbar();
    const trail = screen.getByRole('navigation', { name: 'Trilha' });
    expect(within(trail).getByText('Marketing Insights')).toBeInTheDocument();
    expect(within(trail).getByText(crumb)).toHaveClass('font-medium', 'text-apsen-slate');
  });

  it('renderiza avatar, nome e alternador de tema', () => {
    renderTopbar();
    expect(screen.getByText('A')).toHaveClass('size-[30px]', 'rounded-full', 'bg-apsen-purple');
    expect(screen.getByText('Apsen Marketing')).toHaveClass('max-[560px]:hidden');
    expect(screen.getByRole('button', { name: 'Alternar tema' })).toBeInTheDocument();
  });

  it('alterna o menu pelo burger e desliza a topbar', async () => {
    const { user } = renderTopbar();
    const burger = screen.getByRole('button', { name: 'Alternar menu' });
    const header = screen.getByRole('banner');
    expect(burger).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveClass('left-sidebar');
    await user.click(burger);
    expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveClass('left-0');
    expect(header).not.toHaveClass('left-sidebar');
  });
});
