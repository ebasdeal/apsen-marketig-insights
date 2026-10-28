import { navigationState } from '@test/nextNavigation';
import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import UnknownRoutePage from '../[...slug]/page';
import AppLayout from '../layout';
import AppNotFound from '../not-found';

describe('app/(app)', () => {
  it('o layout protege o shell com o AuthGate', async () => {
    navigationState.pathname = '/planos';
    renderWithProviders(
      <AppLayout>
        <p>conteúdo</p>
      </AppLayout>,
    );
    expect(await screen.findByText('conteúdo')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Menu lateral' })).toBeInTheDocument();
  });

  it('rota desconhecida chama notFound', () => {
    expect(() => UnknownRoutePage()).toThrow('NEXT_NOT_FOUND');
  });

  it('not-found do grupo mostra "Em breve" para telas registradas', () => {
    navigationState.pathname = '/drivers';
    render(<AppNotFound />);
    expect(screen.getByText('Em breve')).toBeInTheDocument();
  });
});
