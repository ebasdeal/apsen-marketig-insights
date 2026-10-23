import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renderiza info, botões circulares e a página ativa', () => {
    render(
      <Pagination page={1} totalPages={3} info="Mostrando 1–8 de 20" onPageChange={vi.fn()} />,
    );
    const nav = screen.getByRole('navigation', { name: 'Paginação' });
    expect(nav).toHaveClass('border-t', 'border-apsen-border', 'py-[14px]', 'mt-[4px]');
    expect(screen.getByText('Mostrando 1–8 de 20')).toHaveClass('text-[13px]', 'text-apsen-muted');
    const active = screen.getByRole('button', { name: 'Página 1' });
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toHaveClass('size-[28px]', 'rounded-full', 'bg-apsen-blue', 'text-white');
    const idle = screen.getByRole('button', { name: 'Página 2' });
    expect(idle).not.toHaveAttribute('aria-current');
    expect(idle).toHaveClass('border-apsen-border', 'bg-apsen-white', 'text-apsen-slate');
    const previous = screen.getByRole('button', { name: 'Página anterior' });
    expect(previous).toBeDisabled();
    expect(previous).toHaveClass('disabled:opacity-[.35]');
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();
  });

  it('mostra reticências e navega entre páginas', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={5} totalPages={10} info="x" onPageChange={onPageChange} />);
    expect(screen.getAllByText('…')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    await user.click(screen.getByRole('button', { name: 'Página 10' }));

    expect(onPageChange.mock.calls).toEqual([[4], [6], [10]]);
  });

  it('desabilita a próxima na última página', () => {
    render(<Pagination page={2} totalPages={2} info="x" onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
  });
});
