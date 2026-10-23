import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

const normalize = (value: string | null) => value?.replace(/\s/g, ' ');

function renderBar(value: number | null) {
  render(<ProgressBar value={value} label="Uso do orçamento" />);
  const bar = screen.getByRole('progressbar', { name: 'Uso do orçamento' });
  const fill = bar.firstElementChild as HTMLElement;
  return { bar, fill };
}

describe('ProgressBar', () => {
  it('exibe o valor dentro da faixa', () => {
    const { bar, fill } = renderBar(42.5);
    expect(bar).toHaveAttribute('aria-valuenow', '42.5');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(normalize(bar.getAttribute('aria-valuetext'))).toBe('42,50%');
    expect(bar).toHaveAttribute('data-exceeded', 'false');
    expect(fill).toHaveStyle({ width: '42.5%' });
    expect(fill).toHaveClass('bg-apsen-blue', 'duration-[400ms]');
    expect(bar).toHaveClass('h-[7px]', 'bg-apsen-border', 'rounded-[4px]');
  });

  it('limita a 100% e destaca quando excedido', () => {
    const { bar, fill } = renderBar(125);
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(normalize(bar.getAttribute('aria-valuetext'))).toBe('125,00%');
    expect(bar).toHaveAttribute('data-exceeded', 'true');
    expect(fill).toHaveStyle({ width: '100%' });
    expect(fill).toHaveClass('bg-apsen-red');
  });

  it('limita valores negativos a zero', () => {
    const { bar, fill } = renderBar(-10);
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(fill).toHaveStyle({ width: '0%' });
  });

  it('trata valor indefinido', () => {
    const { bar, fill } = renderBar(null);
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-valuetext', '—');
    expect(bar).toHaveAttribute('data-exceeded', 'false');
    expect(fill).toHaveStyle({ width: '0%' });
  });
});
