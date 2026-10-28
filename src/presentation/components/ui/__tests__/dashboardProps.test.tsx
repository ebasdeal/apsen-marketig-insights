import { render, screen } from '@testing-library/react';
import { BarRow } from '../BarRow';
import { KpiCard } from '../KpiCard';
import { StatusDistributionRow } from '../StatusDistributionRow';

describe('extensões do UI kit para o dashboard', () => {
  it('KpiCard: hintTone muda só a cor do hint', () => {
    render(<KpiCard label="Drivers" value="14" hint="2 pendentes" tone="blue" hintTone="yellow" />);
    expect(screen.getByText('2 pendentes')).toHaveClass('text-apsen-yellow');
    expect(screen.getByText('14')).toHaveClass('text-apsen-blue');
  });

  it('KpiCard: sem hintTone o hint usa o tom', () => {
    render(<KpiCard label="Restrições" value="8" hint="3 críticas" tone="red" />);
    expect(screen.getByText('3 críticas')).toHaveClass('text-apsen-red');
  });

  it('BarRow: valueWidth compacto ou largo (padrão)', () => {
    render(
      <>
        <BarRow label="A" value={1} max={2} valueLabel="1" valueWidth="compact" />
        <BarRow label="B" value={2} max={2} valueLabel="2" />
      </>,
    );
    expect(screen.getByText('1')).toHaveClass('w-[24px]');
    expect(screen.getByText('2')).toHaveClass('min-w-[72px]');
  });

  it('StatusDistributionRow: pctLabel substitui o percentual', () => {
    render(<StatusDistributionRow label="Aprovado" count={0} pct={0} tone="green" pctLabel="—" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
