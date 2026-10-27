import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../Tooltip';

function renderTooltip() {
  return render(
    <>
      <button type="button">Antes</button>
      <Tooltip label="Ajuda sobre verba">
        <strong>Verba.</strong> Valor investido no período.
      </Tooltip>
      <button type="button">Depois</button>
    </>,
  );
}

describe('Tooltip', () => {
  it('mostra o balão com o mouse e esconde ao sair', async () => {
    const user = userEvent.setup();
    renderTooltip();
    const trigger = screen.getByRole('button', { name: 'Ajuda sobre verba' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.hover(trigger);
    const tip = screen.getByRole('tooltip');
    expect(tip).toBeVisible();
    expect(tip).toHaveClass(
      'bg-apsen-tip-bg',
      'text-apsen-tip-fg',
      'w-[290px]',
      'shadow-apsen-tip',
    );
    await user.unhover(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('abre no foco, fecha com Esc e ao sair, e descreve o botão mesmo fechado', async () => {
    const user = userEvent.setup();
    renderTooltip();
    const trigger = screen.getByRole('button', { name: 'Ajuda sobre verba' });
    expect(trigger).toHaveAccessibleDescription('Verba. Valor investido no período.');
    expect(trigger).toHaveClass('cursor-help', 'focus-ring');
    screen.getByRole('button', { name: 'Antes' }).focus();
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeVisible();
    await user.keyboard('a');
    expect(screen.getByRole('tooltip')).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.tab({ shift: true });
    await user.tab();
    expect(screen.getByRole('tooltip')).toBeVisible();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Depois' })).toHaveFocus();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
