import { navigationState } from '@test/nextNavigation';
import { render, screen } from '@testing-library/react';
import { NotFoundScreen } from '../NotFoundScreen';

describe('NotFoundScreen', () => {
  it('rota registrada sem página mostra "Em breve"', () => {
    navigationState.pathname = '/drivers';
    render(<NotFoundScreen />);
    expect(screen.getByText('Em breve')).toBeInTheDocument();
    expect(
      screen.getByText('Esta tela será disponibilizada em uma próxima entrega.'),
    ).toBeInTheDocument();
    expect(screen.getByText('🔜')).toBeInTheDocument();
  });

  it('rota fora do registro mostra "Página não encontrada"', () => {
    navigationState.pathname = '/nada';
    render(<NotFoundScreen />);
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar ao Dashboard' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
