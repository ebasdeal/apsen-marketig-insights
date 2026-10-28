import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { IconButton } from '../IconButton';
import { EyeIcon } from '../icons';
import { pageCount, pageRangeLabel, pageSlice } from '../pageRange';
import { Pagination } from '../Pagination';
import { SearchInput } from '../SearchInput';
import { Table, type TableColumn } from '../Table';

interface Family {
  id: string;
  name: string;
  skus: number;
}

const FAMILIES: readonly Family[] = [
  { id: 'f1', name: 'Atentah', skus: 6 },
  { id: 'f2', name: 'Lyra', skus: 3 },
  { id: 'f3', name: 'Sertralina', skus: 4 },
];

const COLUMNS: readonly TableColumn<Family>[] = [
  { key: 'name', header: 'Família', render: (row) => row.name, headerClassName: 'text-apsen-blue' },
  { key: 'skus', header: 'SKUs', render: (row) => row.skus, className: 'font-semibold' },
];

function Harness() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filtered = FAMILIES.filter((family) =>
    family.name.toLowerCase().includes(query.toLowerCase()),
  );
  const total = pageCount(filtered.length, 2);
  return (
    <Table
      caption="Famílias"
      columns={COLUMNS}
      rows={pageSlice(filtered, page, 2)}
      rowKey={(row) => row.id}
      emptyText="Nenhuma família encontrada"
      toolbar={
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar"
          aria-label="Buscar família"
        />
      }
      footer={
        <Pagination
          page={page}
          totalPages={total}
          info={pageRangeLabel(page, 2, filtered.length)}
          onPageChange={setPage}
        />
      }
    />
  );
}

describe('Table', () => {
  it('renderiza caption, cabeçalhos, células e ações', () => {
    render(
      <Table
        caption="Famílias"
        columns={COLUMNS}
        rows={FAMILIES}
        rowKey={(row) => row.id}
        emptyText="Vazio"
        actions={(row) => (
          <IconButton aria-label={`Ver ${row.name}`}>
            <EyeIcon />
          </IconButton>
        )}
      />,
    );
    const table = screen.getByRole('table', { name: 'Famílias' });
    const headers = within(table).getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual(['Família', 'SKUs', 'Ações']);
    headers.forEach((header) => expect(header).toHaveAttribute('scope', 'col'));
    expect(headers[0]).toHaveClass('text-apsen-blue');
    expect(headers[1]).toHaveClass('text-apsen-muted');
    expect(within(table).getAllByRole('row')).toHaveLength(FAMILIES.length + 1);
    expect(screen.getByText('6').closest('td')).toHaveClass('font-semibold', 'px-[14px]');
    const action = screen.getByRole('button', { name: 'Ver Atentah' });
    expect(action.parentElement).toHaveClass('flex', 'gap-[2px]');
    expect(table.parentElement).toHaveClass(
      'overflow-x-auto',
      'rounded-apsen-lg',
      'shadow-apsen-sm',
    );
  });

  it('mostra o estado vazio ocupando todas as colunas', () => {
    const { rerender } = render(
      <Table
        caption="Famílias"
        columns={COLUMNS}
        rows={[]}
        rowKey={(row) => row.id}
        emptyText="Nada aqui"
      />,
    );
    const cell = screen.getByText('Nada aqui');
    expect(cell).toHaveAttribute('colspan', '2');
    expect(cell).toHaveClass('p-[30px]', 'text-center');
    expect(screen.queryByRole('columnheader', { name: 'Ações' })).toBeNull();
    rerender(
      <Table
        caption="Famílias"
        columns={COLUMNS}
        rows={[]}
        rowKey={(row) => row.id}
        emptyText="Nada aqui"
        actions={() => null}
      />,
    );
    expect(screen.getByText('Nada aqui')).toHaveAttribute('colspan', '3');
  });

  it('aplica rowClassName por linha', () => {
    render(
      <Table
        caption="Famílias"
        columns={COLUMNS}
        rows={FAMILIES}
        rowKey={(row) => row.id}
        emptyText="Nada aqui"
        rowClassName={(row) => (row.id === 'f1' ? 'bg-apsen-row-active' : '')}
      />,
    );
    expect(screen.getByRole('row', { name: /Atentah/ })).toHaveClass('bg-apsen-row-active');
    expect(screen.getByRole('row', { name: /Lyra/ })).not.toHaveClass('bg-apsen-row-active');
  });

  it('combina busca e paginação nos slots', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const table = screen.getByRole('table', { name: 'Famílias' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Mostrando 1–2 de 3')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Buscar família' }).parentElement?.parentElement,
    ).toHaveClass('mb-[13px]', 'flex');
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(screen.getByText('Sertralina')).toBeInTheDocument();
    expect(screen.queryByText('Atentah')).toBeNull();
    expect(screen.getByText('Mostrando 3–3 de 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Página 1' }));
    await user.type(screen.getByRole('textbox', { name: 'Buscar família' }), 'lyr');
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('Lyra')).toBeInTheDocument();
  });
});
