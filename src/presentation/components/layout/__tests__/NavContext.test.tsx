import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { useSidebarStore } from '../../../stores/sidebarStore';
import { NavProvider, useNav } from '../NavContext';
import { Sidebar } from '../Sidebar';
import { Topbar } from '../Topbar';

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

function renderDrawer() {
  return renderWithProviders(
    <NavProvider>
      <Sidebar />
      <Topbar />
    </NavProvider>,
  );
}

function Consumer() {
  useNav();
  return null;
}

describe('NavContext', () => {
  it('exige NavProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Consumer />)).toThrow('useNav precisa estar dentro de NavProvider');
    consoleError.mockRestore();
  });

  describe('gaveta abaixo de 1024 px', () => {
    beforeEach(() => {
      mockViewport(true);
    });

    it('começa fechada e inerte; abrir foca o primeiro link e Esc devolve o foco ao burger', async () => {
      const { user } = renderDrawer();
      const sidebar = screen.getByRole('complementary', { name: 'Menu lateral', hidden: true });
      const burger = screen.getByRole('button', { name: 'Alternar menu' });
      expect(burger).toHaveAttribute('aria-expanded', 'false');
      expect(sidebar).toHaveAttribute('inert');
      expect(sidebar).toHaveClass('-translate-x-full');
      await user.click(burger);
      expect(sidebar).not.toHaveAttribute('inert');
      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(burger).toHaveAttribute('aria-expanded', 'false');
      expect(burger).toHaveFocus();
    });

    it('fecha pelo overlay', async () => {
      const { user } = renderDrawer();
      const burger = screen.getByRole('button', { name: 'Alternar menu' });
      await user.click(burger);
      await user.click(screen.getByTestId('nav-backdrop'));
      expect(burger).toHaveAttribute('aria-expanded', 'false');
      expect(useSidebarStore.getState().openChoice).toBe(false);
    });

    it('fecha ao navegar por um link', async () => {
      const { user } = renderDrawer();
      const burger = screen.getByRole('button', { name: 'Alternar menu' });
      await user.click(burger);
      await user.click(screen.getByRole('link', { name: 'Dashboard' }));
      expect(burger).toHaveAttribute('aria-expanded', 'false');
    });

    it('ignora outras teclas', async () => {
      const { user } = renderDrawer();
      const burger = screen.getByRole('button', { name: 'Alternar menu' });
      await user.click(burger);
      await user.keyboard('{Shift}');
      expect(burger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('no desktop navegar mantém aberta e Esc não fecha', async () => {
    const { user } = renderDrawer();
    const burger = screen.getByRole('button', { name: 'Alternar menu' });
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    await user.keyboard('{Escape}');
    expect(burger).toHaveAttribute('aria-expanded', 'true');
  });
});
