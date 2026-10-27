import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('emite o novo estado no clique e no Espaço sem mudar sozinho', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <Toggle checked={false} onChange={onChange} aria-label="Agente ativo" />,
    );
    const toggle = screen.getByRole('switch', { name: 'Agente ativo' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(toggle).not.toBeChecked();
    toggle.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
    rerender(<Toggle checked onChange={onChange} aria-label="Agente ativo" />);
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('não emite desabilitado e expõe descrição e visual do trilho', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <>
        <span id="status">Rascunho</span>
        <Toggle
          checked={false}
          onChange={onChange}
          aria-label="Publicar"
          aria-describedby="status"
          disabled
        />
      </>,
    );
    const toggle = screen.getByRole('switch', { name: 'Publicar' });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAccessibleDescription('Rascunho');
    await user.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('label')).toHaveClass('w-[38px]', 'h-[21px]');
    expect(toggle.nextElementSibling).toHaveClass('peer-checked:bg-apsen-green', 'bg-apsen-border');
  });
});
