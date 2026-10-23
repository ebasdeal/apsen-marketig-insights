import { navigationState } from '@test/nextNavigation';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { NavProvider } from '../NavContext';
import type { NavModule } from '../navItems';
import { NavModuleGroup } from '../NavModuleGroup';

const MODULE: NavModule = {
  key: 'teste',
  label: 'Módulo',
  items: [
    { href: '/campaigns', label: 'Lista', badge: { value: 4, tone: 'blue' } },
    { href: '/', label: 'Início' },
  ],
};

describe('NavModuleGroup', () => {
  it('renderiza badge opcional e diferencia item ativo do inativo', () => {
    navigationState.pathname = '/campaigns';
    renderWithProviders(
      <NavProvider>
        <NavModuleGroup module={MODULE} />
      </NavProvider>,
    );
    const header = screen.getByRole('button', { name: /Módulo/ });
    expect(header).toHaveClass('text-[10px]', 'uppercase', 'tracking-[.12em]');
    expect(screen.getByText('▼')).toHaveClass('rotate-180');
    expect(screen.getByText('4')).toHaveClass('bg-apsen-blue');
    expect(screen.getByRole('link', { name: /Lista/ })).toHaveAttribute('aria-current', 'page');
    const inactive = screen.getByRole('link', { name: 'Início' });
    expect(inactive).not.toHaveAttribute('aria-current');
    expect(inactive).toHaveClass('border-transparent', 'text-apsen-muted', 'pl-[44px]');
  });
});
