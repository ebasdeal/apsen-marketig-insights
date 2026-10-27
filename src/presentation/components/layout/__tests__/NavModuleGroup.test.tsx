import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { NavProvider } from '../NavContext';
import type { NavModule } from '../navItems';
import { NavModuleGroup } from '../NavModuleGroup';

const MODULE: NavModule = {
  id: 'drivers',
  label: 'Módulo',
  items: [
    { screenId: 'lista', href: '/drivers', label: 'Lista', badge: { key: 'lista', tone: 'blue' } },
    { screenId: 'export', href: '/drivers/exportar', label: 'Exportar' },
    { screenId: 'catalogo', href: '/drivers/catalogo', label: 'Catálogo' },
  ],
};

function renderGroup(props: Partial<Parameters<typeof NavModuleGroup>[0]> = {}) {
  const onToggle = vi.fn();
  const result = renderWithProviders(
    <NavProvider>
      <NavModuleGroup
        module={MODULE}
        open
        onToggle={onToggle}
        activeScreenId="lista"
        badges={NAV_BADGES_FIXTURE}
        nivel={4}
        {...props}
      />
    </NavProvider>,
  );
  return { ...result, onToggle };
}

describe('NavModuleGroup', () => {
  it('renderiza badge, diferencia ativo do inativo e não tem accent sem cor', () => {
    renderGroup();
    const header = screen.getByRole('button', { name: /Módulo/ });
    expect(header).toHaveClass('text-[10px]', 'uppercase', 'tracking-[.12em]');
    expect(header.querySelector('.w-\\[3px\\]')).toBeNull();
    expect(screen.getByText('▼')).toHaveClass('rotate-180', 'motion-reduce:transition-none');
    expect(screen.getByText('4')).toHaveClass('bg-apsen-blue');
    expect(screen.getByRole('link', { name: /Lista/ })).toHaveAttribute('aria-current', 'page');
    const inactive = screen.getByRole('link', { name: 'Catálogo' });
    expect(inactive).not.toHaveAttribute('aria-current');
    expect(inactive).toHaveClass('border-transparent', 'text-apsen-muted', 'pl-[44px]');
  });

  it('esconde itens acima do nível e a lista quando fechado', () => {
    const { unmount } = renderGroup({ nivel: 2 });
    expect(screen.queryByRole('link', { name: 'Exportar' })).not.toBeInTheDocument();
    unmount();
    renderGroup({ open: false });
    expect(screen.getByRole('button', { name: /Módulo/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('link', { name: /Lista/ })).not.toBeInTheDocument();
  });

  it('avisa o clique no cabeçalho', async () => {
    const { user, onToggle } = renderGroup({ badges: undefined });
    expect(screen.getByRole('link', { name: 'Lista' })).toHaveTextContent(/^Lista$/);
    await user.click(screen.getByRole('button', { name: /Módulo/ }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
