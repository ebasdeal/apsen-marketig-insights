import { render, screen } from '@testing-library/react';
import Loading from '../loading';

describe('app/loading', () => {
  it('anuncia carregamento sem animação', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Carregando…');
    expect(status.querySelector('.animate-spin')).toBeNull();
  });
});
