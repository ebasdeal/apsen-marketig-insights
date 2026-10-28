import { render, screen } from '@testing-library/react';
import { CardTable } from '../CardTable';

interface Row {
  id: string;
  nome: string;
  descricao: string;
}

const ROWS: Row[] = [{ id: '1', nome: 'ENIAGOR', descricao: 'Família com descrição longa' }];

function renderTable() {
  render(
    <CardTable<Row>
      caption="Catálogo"
      rows={ROWS}
      rowKey={(row) => row.id}
      emptyText="Nada"
      columns={[
        { key: 'nome', header: 'Família', render: (row) => row.nome, className: 'font-medium' },
        { key: 'descricao', header: 'Descrição', render: (row) => row.descricao, wrap: true },
        { key: 'n', header: 'SKUs', render: () => 6, center: true },
      ]}
    />,
  );
}

describe('CardTable', () => {
  it('mantém as classes da célula intactas (separador cinza, sem borda preta)', () => {
    renderTable();
    const cell = screen.getByText('ENIAGOR').closest('td');
    expect(cell).toHaveClass('border-b', 'border-apsen-bg', 'whitespace-nowrap', 'font-medium');
    expect(cell?.className).not.toMatch(/ap en|white pace/);
  });

  it('só quebra linha nas colunas marcadas com wrap e centraliza quando pedido', () => {
    renderTable();
    expect(screen.getByText('Família com descrição longa').closest('td')).not.toHaveClass(
      'whitespace-nowrap',
    );
    expect(screen.getByText('6').closest('td')).toHaveClass('text-center', 'whitespace-nowrap');
  });
});
