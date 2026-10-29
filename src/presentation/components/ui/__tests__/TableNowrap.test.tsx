import { render, screen } from '@testing-library/react';
import { Table, type TableColumn } from '../Table';

interface Row {
  id: string;
  codigo: string;
  descricao: string;
}

const COLUMNS: readonly TableColumn<Row>[] = [
  { key: 'codigo', header: 'Código', render: (row) => row.codigo },
  { key: 'descricao', header: 'Descrição', wrap: true, render: (row) => row.descricao },
];

describe('Table: células curtas não quebram linha', () => {
  it('aplica whitespace-nowrap por padrão e libera colunas descritivas', () => {
    render(
      <Table
        caption="Itens"
        columns={COLUMNS}
        rows={[{ id: '1', codigo: 'PLP-2026-07-001', descricao: 'Texto longo descritivo' }]}
        rowKey={(row) => row.id}
        emptyText="Vazio"
        actions={() => <button type="button">Abrir</button>}
      />,
    );
    expect(screen.getByRole('cell', { name: 'PLP-2026-07-001' })).toHaveClass('whitespace-nowrap');
    expect(screen.getByRole('cell', { name: 'Texto longo descritivo' })).not.toHaveClass(
      'whitespace-nowrap',
    );
    expect(screen.getByRole('button', { name: 'Abrir' }).closest('td')).toHaveClass(
      'whitespace-nowrap',
    );
  });
});
