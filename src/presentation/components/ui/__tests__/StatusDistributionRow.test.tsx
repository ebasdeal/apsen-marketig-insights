import { render, screen } from '@testing-library/react';
import { StatusDistributionRow } from '../StatusDistributionRow';

describe('StatusDistributionRow', () => {
  it('mostra contagem, barra e percentual na cor do tom', () => {
    const { container } = render(
      <StatusDistributionRow label="Aprovados" count={12} pct={43} tone="green" />,
    );
    const meter = screen.getByRole('meter', { name: 'Aprovados' });
    expect(meter).toHaveAttribute('aria-valuenow', '43');
    expect(meter).toHaveClass('h-[5px]', 'w-[70px]', 'rounded-[3px]', 'bg-apsen-bg');
    const fill = meter.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('43%');
    expect(fill).toHaveClass('bg-apsen-green');
    expect(screen.getByText('43%')).toHaveClass('min-w-[28px]', 'text-[11px]', 'text-apsen-muted');
    expect(screen.getByText('12')).toHaveClass('text-apsen-green-fg', 'font-semibold');
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'size-[9px]',
      'rounded-full',
      'bg-apsen-green',
    );
  });

  it.each([
    ['orange', 'bg-apsen-orange'],
    ['red', 'bg-apsen-red'],
    ['muted', 'bg-apsen-muted'],
  ] as const)('pinta o tom %s e limita o percentual', (tone, bg) => {
    render(<StatusDistributionRow label="Itens" count={1} pct={140} tone={tone} />);
    const meter = screen.getByRole('meter', { name: 'Itens' });
    expect(meter).toHaveAttribute('aria-valuenow', '100');
    expect(meter.firstElementChild).toHaveClass(bg);
  });
});
