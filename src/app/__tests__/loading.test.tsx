import { render, screen } from '@testing-library/react';
import Loading from '../loading';

describe('app/loading', () => {
  it('renderiza o PageSkeleton sem spinner', () => {
    const { container } = render(<Loading />);
    const status = screen.getByRole('status', { name: 'Carregando…' });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('[data-skeleton="block"]').length).toBeGreaterThan(0);
    expect(status.querySelector('.animate-spin')).toBeNull();
  });
});
