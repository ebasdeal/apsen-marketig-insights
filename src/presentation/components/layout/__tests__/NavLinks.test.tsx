import { navigationState } from '@test/nextNavigation';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { NavProvider } from '../NavContext';
import { NavLinks } from '../NavLinks';

function renderNav() {
  return renderWithProviders(
    <NavProvider>
      <NavLinks />
    </NavProvider>,
  );
}

describe('NavLinks', () => {
  it('renderiza o item raiz e o módulo Campanhas com destinos corretos', () => {
    navigationState.pathname = '/campaigns';
    renderNav();
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: /Campanhas/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Todas as Campanhas' })).toHaveAttribute(
      'href',
      '/campaigns',
    );
  });

  it('marca Dashboard como pílula ativa na raiz e mantém o módulo fechado', () => {
    renderNav();
    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboard).toHaveAttribute('aria-current', 'page');
    expect(dashboard).toHaveClass(
      'border-apsen-blue',
      'bg-apsen-blue',
      'text-white',
      'rounded-apsen',
    );
    expect(dashboard).not.toHaveClass('border-transparent');
    expect(screen.getByRole('button', { name: /Campanhas/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('link', { name: 'Todas as Campanhas' })).not.toBeInTheDocument();
  });

  it('marca Todas as Campanhas como ativo em rotas de detalhe', () => {
    navigationState.pathname = '/campaigns/xyz';
    renderNav();
    const item = screen.getByRole('link', { name: 'Todas as Campanhas' });
    expect(item).toHaveAttribute('aria-current', 'page');
    expect(item).toHaveClass('border-apsen-blue', 'bg-apsen-blue-bg', 'text-apsen-blue');
    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboard).not.toHaveAttribute('aria-current');
    expect(dashboard).toHaveClass('text-apsen-muted');
  });

  it('alterna a abertura do módulo ao clicar no cabeçalho', async () => {
    navigationState.pathname = '/campaigns';
    const { user } = renderNav();
    const header = screen.getByRole('button', { name: /Campanhas/ });
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Todas as Campanhas' })).not.toBeInTheDocument();
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Todas as Campanhas' })).toBeInTheDocument();
  });
});
