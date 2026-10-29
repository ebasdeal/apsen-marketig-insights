import { render, screen } from '@testing-library/react';
import { ColorPill } from '../ColorPill';
import { PILL_OUTLINED, PILL_SOFT, type PillColor } from '../pillColors';

const COLORS: readonly PillColor[] = [
  'blue',
  'purple',
  'cyan',
  'amber',
  'emerald',
  'red',
  'lime',
  'slate',
];

describe('ColorPill', () => {
  it('aplica o outlined com fundo e borda translúcidos', () => {
    render(<ColorPill color="amber">NEURO</ColorPill>);
    expect(screen.getByText('NEURO')).toHaveClass(
      'text-apsen-pal-amber',
      'bg-apsen-pal-amber/[9.4%]',
      'border-apsen-pal-amber/[18.8%]',
      'border',
      'rounded-[10px]',
      'text-[11.5px]',
      'font-semibold',
    );
  });

  it('aplica o soft sem borda', () => {
    render(
      <ColorPill color="emerald" variant="soft">
        ● Plano MVP
      </ColorPill>,
    );
    const pill = screen.getByText('● Plano MVP');
    expect(pill).toHaveClass('bg-apsen-pal-emerald/[8.2%]', 'rounded-[6px]', 'font-bold');
    expect(pill).not.toHaveClass('border');
  });

  it.each(COLORS)('tem classes para a cor %s', (color) => {
    expect(PILL_OUTLINED[color]).toContain(`text-apsen-pal-${color}`);
    expect(PILL_SOFT[color]).toContain(`bg-apsen-pal-${color}/[8.2%]`);
  });
});
