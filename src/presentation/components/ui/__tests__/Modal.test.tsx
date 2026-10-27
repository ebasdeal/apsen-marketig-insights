import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Modal } from '../Modal';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo ciclo"
        footer={<button type="button">Salvar</button>}
      >
        <input aria-label="Nome do ciclo" />
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('renderiza um diálogo nomeado pelo título, com corpo e rodapé', () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        title="Novo ciclo"
        footer={<button type="button">Salvar</button>}
      >
        <p>Corpo do modal</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Novo ciclo' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveClass('w-[500px]', 'rounded-apsen-lg', 'shadow-apsen-modal');
    expect(screen.getByText('Corpo do modal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' }).parentElement).toHaveClass(
      'justify-end',
      'border-t',
    );
  });

  it('usa a largura grande e omite o rodapé sem footer', () => {
    render(
      <Modal open onClose={vi.fn()} title="Detalhe" size="lg">
        <p>Corpo</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Detalhe' });
    expect(dialog).toHaveClass('w-[680px]');
    expect(dialog.querySelector('.border-t')).toBeNull();
  });

  it('não renderiza nada fechado', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Novo ciclo">
        <p>Corpo</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('chama onClose pelo botão Fechar, pelo Esc e pelo overlay, mas não por clique interno', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="Novo ciclo">
        <p>Corpo</p>
      </Modal>,
    );
    await user.click(screen.getByText('Corpo'));
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
    const overlay = screen.getByRole('dialog').parentElement;
    if (overlay === null) {
      throw new Error('overlay ausente');
    }
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('prende o foco dentro do modal e devolve ao botão que abriu', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    await user.click(opener);
    const close = screen.getByRole('button', { name: 'Fechar' });
    expect(close).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Nome do ciclo' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });
});
