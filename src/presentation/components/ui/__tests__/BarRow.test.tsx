import { render, screen } from '@testing-library/react';
import { BarRow } from '../BarRow';

function renderRow(value: number, max: number, fillClassName?: string) {
  render(
    <BarRow
      label="Google Ads"
      value={value}
      max={max}
      valueLabel="R$ 1.000,00"
      {...(fillClassName === undefined ? {} : { fillClassName })}
    />,
  );
  const meter = screen.getByRole('meter', { name: 'Google Ads' });
  return { meter, fill: meter.firstElementChild as HTMLElement };
}

describe('BarRow', () => {
  it('calcula a largura relativa ao maior valor', () => {
    const { meter, fill } = renderRow(50, 200, 'bg-apsen-ch-google');
    expect(meter).toHaveAttribute('aria-valuenow', '25');
    expect(meter).toHaveAttribute('aria-valuetext', 'R$ 1.000,00');
    expect(meter).toHaveClass('h-[7px]', 'bg-apsen-bg');
    expect(fill).toHaveStyle({ width: '25%' });
    expect(fill).toHaveClass('bg-apsen-ch-google');
    expect(screen.getByText('R$ 1.000,00')).toHaveClass('min-w-[72px]', 'text-right');
    expect(screen.getByText('Google Ads')).toHaveClass('w-[110px]', 'truncate');
  });

  it('ocupa 100% no maior valor e usa azul por padrão', () => {
    const { fill } = renderRow(200, 200);
    expect(fill).toHaveStyle({ width: '100%' });
    expect(fill).toHaveClass('bg-apsen-blue');
  });

  it('limita a 100% quando o valor passa do máximo', () => {
    const { fill } = renderRow(300, 200);
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it.each([
    [10, 0],
    [0, 100],
    [-5, 100],
  ])('zera a largura para valor %s e máximo %s', (value, max) => {
    const { meter, fill } = renderRow(value, max);
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(fill).toHaveStyle({ width: '0%' });
  });
});
