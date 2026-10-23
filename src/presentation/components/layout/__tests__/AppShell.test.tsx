import { navigationState } from '@test/nextNavigation';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { AppShell } from '../AppShell';

function mockViewport(mobile: boolean) {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: mobile,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
}

function renderShell() {
  return renderWithProviders(
    <AppShell>
      <p>conteúdo da página</p>
    </AppShell>,
  );
}

describe('AppShell', () => {
  it('renderiza sidebar com logo e footer, topbar, navegação e conteúdo', () => {
    navigationState.pathname = '/campaigns';
    renderShell();
    const sidebar = screen.getByRole('complementary', { name: 'Menu lateral' });
    expect(sidebar).toHaveClass('w-sidebar', 'fixed', 'h-screen');
    expect(screen.getByRole('img', { name: 'Apsen' })).toHaveClass('h-[34px]', 'w-auto');
    expect(screen.getByText('Marketing')).toHaveClass('text-[12px]', 'font-bold');
    expect(screen.getByText('Insights')).toHaveClass('text-[10.5px]', 'text-apsen-muted');
    expect(sidebar).toHaveTextContent('Apsen FarmacêuticaMarketing Insights · Campanhas');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Todas as Campanhas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Alternar tema' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('conteúdo da página');
  });

  it('começa aberto no desktop e recolhe sidebar, topbar e main pelo burger', async () => {
    const { user } = renderShell();
    const sidebar = screen.getByRole('complementary', { name: 'Menu lateral' });
    const main = screen.getByRole('main');
    expect(sidebar).not.toHaveClass('-translate-x-full');
    expect(main).toHaveClass('ml-sidebar');
    expect(screen.getByTestId('nav-backdrop')).toHaveClass('hidden', 'max-[800px]:block');
    await user.click(screen.getByRole('button', { name: 'Alternar menu' }));
    expect(sidebar).toHaveClass('-translate-x-full');
    expect(main).toHaveClass('ml-0');
    expect(main).not.toHaveClass('ml-sidebar');
    expect(screen.queryByTestId('nav-backdrop')).not.toBeInTheDocument();
  });

  it('começa fechado no mobile e fecha pelo backdrop', async () => {
    mockViewport(true);
    const { user } = renderShell();
    const sidebar = screen.getByRole('complementary', { name: 'Menu lateral', hidden: true });
    const burger = screen.getByRole('button', { name: 'Alternar menu' });
    expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(sidebar).toHaveClass('-translate-x-full');
    await user.click(burger);
    expect(sidebar).not.toHaveClass('-translate-x-full');
    await user.click(screen.getByTestId('nav-backdrop'));
    expect(burger).toHaveAttribute('aria-expanded', 'false');
  });

  it('fecha a sidebar ao navegar no mobile', async () => {
    mockViewport(true);
    const { user } = renderShell();
    const burger = screen.getByRole('button', { name: 'Alternar menu' });
    await user.click(burger);
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(burger).toHaveAttribute('aria-expanded', 'false');
  });

  it('mantém a sidebar aberta ao navegar no desktop', async () => {
    const { user } = renderShell();
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(screen.getByRole('button', { name: 'Alternar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('zera o scroll do main ao trocar de rota', () => {
    const { rerender } = renderShell();
    const main = screen.getByRole('main');
    main.scrollTop = 120;
    navigationState.pathname = '/campaigns';
    rerender(
      <AppShell>
        <p>outra página</p>
      </AppShell>,
    );
    expect(main.scrollTop).toBe(0);
  });
});
