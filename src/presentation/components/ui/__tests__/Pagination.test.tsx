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

describe('Pagination com tamanho de página', () => {
  it('oferece 10/25/50 e chama só onPageSizeChange', async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Pagination
        page={2}
        totalPages={5}
        info="x"
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Itens por página' });
    expect(select).toHaveValue('10');
    expect(Array.from(select.querySelectorAll('option'), (option) => option.textContent)).toEqual([
      '10',
      '25',
      '50',
    ]);
    await user.selectOptions(select, '25');
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('aceita opções próprias e usa a primeira sem pageSize', () => {
    render(
      <Pagination
        page={1}
        totalPages={2}
        pageSizeOptions={[5, 15]}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Itens por página' })).toHaveValue('5');
  });

  it('não mostra o seletor sem onPageSizeChange', () => {
    render(<Pagination page={1} totalPages={2} info="x" onPageChange={vi.fn()} />);
    expect(screen.queryByRole('combobox', { name: 'Itens por página' })).toBeNull();
  });
});

describe('Pagination centralizada', () => {
  it('mostra Página X de Y com botões redondos sem borda', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination variant="centered" page={2} totalPages={5} onPageChange={onPageChange} />);
    const nav = screen.getByRole('navigation', { name: 'Paginação' });
    expect(nav).toHaveClass('justify-center', 'flex-wrap', 'gap-[5px]', 'pt-[16px]', 'pb-[2px]');
    expect(screen.getByText('Página 2 de 5')).toHaveClass('text-[12px]', 'mr-[6px]');
    const current = screen.getByRole('button', { name: 'Página 2' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass('bg-apsen-blue', 'text-white', 'font-semibold');
    const other = screen.getByRole('button', { name: 'Página 1' });
    expect(other).toHaveClass(
      'h-[30px]',
      'min-w-[30px]',
      'border-0',
      'rounded-full',
      'hover:bg-apsen-blue-bg',
    );
    const previous = screen.getByRole('button', { name: 'Página anterior' });
    expect(previous).toHaveClass('rounded-[6px]', 'text-[14px]', 'disabled:opacity-[.35]');
    await user.click(previous);
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    await user.click(screen.getByRole('button', { name: 'Página 5' }));
    expect(onPageChange.mock.calls).toEqual([[1], [3], [5]]);
  });

  it('desabilita as pontas e mostra reticências', () => {
    render(<Pagination layout="centered" page={1} totalPages={8} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByText('…')).toHaveClass('h-[30px]', 'min-w-[30px]');
    expect(screen.getByText('Página 1 de 8')).toBeInTheDocument();
  });

  it('desabilita a próxima na última página e aceita info e seletor', () => {
    render(
      <Pagination
        variant="centered"
        page={3}
        totalPages={3}
        info="Página 3 de 3 (14 itens)"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
    expect(screen.getByText('Página 3 de 3 (14 itens)')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Itens por página' })).toBeInTheDocument();
  });

  it('não renderiza nada com uma página', () => {
    const { container } = render(
      <Pagination variant="centered" page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
