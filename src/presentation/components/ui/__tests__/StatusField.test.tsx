import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { StatusField } from '../StatusField';

const DESCRIPTION = 'Tipos inativos não aparecem no formulário de registro.';

describe('StatusField', () => {
  it('nomeia e descreve o switch e mostra Ativo em verde', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <StatusField
        title="Ativo no Driver Form"
        description={DESCRIPTION}
        checked
        onChange={onChange}
      />,
    );
    const toggle = screen.getByRole('switch', { name: 'Ativo no Driver Form' });
    expect(toggle).toBeChecked();
    expect(toggle).toHaveAccessibleDescription(DESCRIPTION);
    expect(screen.getByText('Ativo')).toHaveClass('text-[12px]', 'font-medium', 'text-apsen-green');
    expect(screen.getByText('Ativo no Driver Form')).toHaveClass('text-[13px]', 'font-medium');
    expect(screen.getByText(DESCRIPTION)).toHaveClass('mt-[2px]', 'block', 'text-[11.5px]');
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(toggle).toBeChecked();
  });

  it('mostra Inativo em cinza quando desligado e aceita rótulos próprios', () => {
    const { rerender } = render(
      <StatusField title="Ativo" description="d" checked={false} onChange={vi.fn()} />,
    );
    expect(screen.getByText('Inativo')).toHaveClass('text-apsen-muted');
    rerender(
      <StatusField
        title="Publicação"
        description="d"
        checked={false}
        offLabel="Rascunho"
        onChange={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByText('Rascunho')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Publicação' })).toBeDisabled();
  });
});
