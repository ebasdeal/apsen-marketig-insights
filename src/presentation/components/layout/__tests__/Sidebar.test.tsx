import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import { NavProvider } from '../NavContext';
import { Sidebar } from '../Sidebar';

describe('Sidebar', () => {
  it('mostra logo Demand Intelligence, navegação e rodapé do DI', async () => {
    renderWithProviders(
      <NavProvider>
        <Sidebar />
      </NavProvider>,
    );
    const sidebar = screen.getByRole('complementary', { name: 'Menu lateral' });
    expect(sidebar).toHaveClass(
      'w-sidebar',
      'fixed',
      'top-0',
      'h-screen',
      'motion-reduce:transition-none',
    );
    expect(screen.getByRole('img', { name: 'Apsen' })).toHaveClass('h-[34px]', 'w-auto');
    expect(screen.getByText('Demand')).toHaveClass('text-[12px]', 'font-bold');
    expect(screen.getByText('Intelligence')).toHaveClass('text-[10.5px]', 'text-apsen-muted');
    expect(sidebar).toHaveTextContent('Apsen FarmacêuticaPLP Agent · Demand Intelligence');
    expect(screen.getByTestId('nav-backdrop')).toHaveClass('hidden', 'max-[800px]:block');
    await screen.findByRole('button', { name: /Planos de Produção/ });
  });
});
