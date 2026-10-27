import { navigationState } from '@test/nextNavigation';
import { render, screen } from '@testing-library/react';
import NotFound from '../not-found';

describe('app/not-found', () => {
  it('rota registrada sem página mostra "Em breve"', () => {
    navigationState.pathname = '/drivers';
    render(<NotFound />);
    expect(screen.getByText('Em breve')).toBeInTheDocument();
    expect(
      screen.getByText('Esta tela será disponibilizada em uma próxima entrega.'),
    ).toBeInTheDocument();
  });

  it('informa página inexistente e oferece retorno ao dashboard', () => {
    navigationState.pathname = '/nada';
    render(<NotFound />);
    expect(screen.getByRole('alert')).toHaveTextContent('🔍');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByText('O endereço acessado não existe ou foi removido.')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: '← Voltar ao Dashboard' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveClass('border-apsen-blue', 'text-apsen-blue');
  });
});
