import { CICLO_RASCUNHO, CICLOS_PAGE_FIXTURE, cicloRow } from '@test/fixtures/ciclos';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CiclosTable } from '../components/CiclosTable';

const ROWS = [...CICLOS_PAGE_FIXTURE.rows, cicloRow(CICLO_RASCUNHO)];

function setup(pendingId: string | null = null) {
  const onEdit = vi.fn();
  const onToggle = vi.fn();
  render(<CiclosTable rows={ROWS} pendingId={pendingId} onEdit={onEdit} onToggle={onToggle} />);
  return { onEdit, onToggle, user: userEvent.setup() };
}

describe('CiclosTable (CA-04)', () => {
  it('ativo: toggle ligado, Ativo, editar, ver drivers e excluir desabilitado', async () => {
    const { onEdit, onToggle, user } = setup();
    expect(screen.getByRole('table', { name: 'Ciclos de planejamento' })).toBeInTheDocument();
    const row = screen.getByRole('row', { name: /Planejamento Julho 2026/ });
    expect(within(row).getByRole('switch', { name: 'Ciclo PLP-2026-07 ativo' })).toBeChecked();
    expect(within(row).getByText('Ativo')).toHaveClass('text-apsen-green');
    const excluir = within(row).getByRole('button', { name: 'Excluir ciclo PLP-2026-07' });
    expect(excluir).toBeDisabled();
    expect(excluir).toHaveAttribute('title', 'Ciclo ativo — não pode excluir');
    await user.click(within(row).getByRole('button', { name: 'Editar ciclo PLP-2026-07' }));
    expect(onEdit).toHaveBeenCalledWith(ROWS[0]);
    await user.click(within(row).getByRole('switch'));
    expect(onToggle).toHaveBeenCalledWith(ROWS[0], false);
    expect(within(row).getByText('4')).toHaveClass('text-apsen-blue');
    expect(within(row).getByText('Criado em 01/06/2026 · v1')).toBeInTheDocument();
  });

  it('encerrado: Badge "Encerrado" e só ver drivers', () => {
    setup();
    const row = screen.getByRole('row', { name: /Planejamento Junho 2026/ });
    expect(within(row).getByText('Encerrado')).toBeInTheDocument();
    expect(within(row).queryByRole('switch')).toBeNull();
    expect(within(row).queryAllByRole('button')).toHaveLength(0);
    expect(
      within(row).getByRole('link', { name: 'Ver drivers do ciclo PLP-2026-06' }),
    ).toHaveAttribute('href', '/admin/ingeridos');
    expect(within(row).getByText('PLP-2026-06')).toHaveClass('text-apsen-muted');
  });

  it('rascunho: toggle desligado, Rascunho, editar e sem excluir', () => {
    setup(CICLO_RASCUNHO.id);
    const row = screen.getByRole('row', { name: /Planejamento Agosto 2026/ });
    const toggle = within(row).getByRole('switch', { name: 'Ciclo PLP-2026-08 ativo' });
    expect(toggle).not.toBeChecked();
    expect(toggle).toBeDisabled();
    expect(within(row).getByText('Rascunho')).toHaveClass('text-apsen-muted');
    expect(
      within(row).getByRole('button', { name: 'Editar ciclo PLP-2026-08' }),
    ).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /Excluir/ })).toBeNull();
  });
});
