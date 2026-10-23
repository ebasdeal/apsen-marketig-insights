import { render, screen } from '@testing-library/react';
import NotFound from '../not-found';

describe('app/not-found', () => {
  it('informa página inexistente e oferece retorno ao dashboard', () => {
    render(<NotFound />);
    expect(screen.getByRole('alert')).toHaveTextContent('🔍');
    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByText('O endereço acessado não existe ou foi removido.')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: '← Voltar ao Dashboard' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveClass('border-apsen-blue', 'text-apsen-blue');
  });
});
