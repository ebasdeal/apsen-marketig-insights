import { render, screen } from '@testing-library/react';
import Loading from '../loading';

describe('app/loading', () => {
  it('renderiza o loader da Apsen na área de conteúdo', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Carregando…');
    expect(status).toHaveAttribute('data-variant', 'content');
    expect(screen.getByTestId('loader-logo')).toBeInTheDocument();
  });
});
