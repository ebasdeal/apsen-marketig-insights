import { renderWithProviders } from '@test/renderWithProviders';
import { render, screen } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

function setup(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const result = renderWithProviders(
    <ConfirmDialog
      open
      title='Remover a fonte "IQVIA"?'
      message="Esta ação não pode ser desfeita."
      confirmLabel="Remover"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { ...result, onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('abre nomeado pelo título, com foco no cancelar e ação vermelha', async () => {
    const { user, onConfirm, onCancel } = setup();
    expect(screen.getByRole('dialog', { name: 'Remover a fonte "IQVIA"?' })).toBeInTheDocument();
    expect(screen.getByText('Esta ação não pode ser desfeita.')).toHaveClass(
      'text-[13px]',
      'text-apsen-slate-3',
    );
    const cancel = screen.getByRole('button', { name: 'Cancelar' });
    expect(cancel).toHaveFocus();
    expect(cancel).toHaveClass('border-apsen-border', 'px-[12px]');
    const confirm = screen.getByRole('button', { name: 'Remover' });
    expect(confirm).toHaveClass('bg-apsen-red', 'text-white');
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await user.click(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('bloqueia o fechamento durante o envio', async () => {
    const { user, onCancel } = setup({ pending: true });
    const confirm = screen.getByRole('button', { name: 'Salvando…' });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('aceita tom primário, description e rótulo de cancelar', () => {
    setup({
      tone: 'primary',
      message: undefined,
      description: 'As alterações serão perdidas.',
      cancelLabel: 'Continuar editando',
      confirmLabel: 'Descartar',
    });
    expect(screen.getByRole('button', { name: 'Descartar' })).toHaveClass('bg-apsen-blue');
    expect(screen.getByRole('button', { name: 'Continuar editando' })).toBeInTheDocument();
    expect(screen.getByText('As alterações serão perdidas.')).toBeInTheDocument();
  });

  it('não renderiza fechado nem mensagem vazia', () => {
    const { rerender } = render(
      <ConfirmDialog
        open={false}
        title="X"
        confirmLabel="Ok"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(
      <ConfirmDialog open title="X" confirmLabel="Ok" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByRole('dialog', { name: 'X' }).querySelector('p')).toBeNull();
  });
});
