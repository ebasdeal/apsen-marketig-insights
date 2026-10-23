import { render, screen } from '@testing-library/react';
import { NavBadge } from '../NavBadge';

describe('NavBadge', () => {
  it('usa o tom azul por padrão', () => {
    render(<NavBadge value={3} />);
    expect(screen.getByText('3')).toHaveClass('bg-apsen-blue', 'text-white', 'text-[10px]');
  });

  it.each([
    ['teal', 'bg-apsen-teal'],
    ['red', 'bg-apsen-red'],
    ['purple', 'bg-apsen-purple'],
    ['orange', 'bg-apsen-orange'],
    ['gray', 'bg-apsen-muted'],
    ['soon', 'bg-apsen-cyan'],
  ] as const)('tom %s aplica %s', (tone, expected) => {
    render(<NavBadge value="7" tone={tone} />);
    expect(screen.getByText('7')).toHaveClass(expected);
  });

  it('tom soon usa fonte de 9px', () => {
    render(<NavBadge value="Em breve" tone="soon" />);
    expect(screen.getByText('Em breve')).toHaveClass('text-[9px]');
  });
});
