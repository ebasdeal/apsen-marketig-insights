import { planoItemRowFixture } from '@test/fakes/planos';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanoItensTable } from '../components/PlanoItensTable';

const APROVADO = planoItemRowFixture();
const PENDENTE = planoItemRowFixture({
  id: 'uuid-5',
  codigo: 'PLP-2026-07-005',
  status: 'pendente',
  statusLabel: 'Pendente',
  editavel: true,
});

function setup(props: Partial<Parameters<typeof PlanoItensTable>[0]> = {}) {
  const onOrdenar = vi.fn();
  const onExcluir = vi.fn();
  render(
    <PlanoItensTable
      itens={[APROVADO, PENDENTE]}
      ordem={{ campo: 'codigo', direcao: 'asc' }}
      podeEditar
      onOrdenar={onOrdenar}
      onExcluir={onExcluir}
      {...props}
    />,
  );
  return { user: userEvent.setup(), onOrdenar, onExcluir };
}

describe('PlanoItensTable', () => {
  it('CA-05 / RN-09: cabeçalho marca e desmarca as linhas da página', async () => {
    const { user, onExcluir, onOrdenar } = setup();
    const todos = screen.getByRole('checkbox', { name: 'Selecionar itens da página' });
    await user.click(todos);
    expect(screen.getByRole('checkbox', { name: 'Selecionar PLP-2026-07-001' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Selecionar PLP-2026-07-005' })).toBeChecked();
    expect(todos).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Selecionar PLP-2026-07-005' }));
    expect(todos).not.toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Selecionar PLP-2026-07-005' }));
    await user.click(todos);
    expect(screen.getByRole('checkbox', { name: 'Selecionar PLP-2026-07-001' })).not.toBeChecked();
    expect(onExcluir).not.toHaveBeenCalled();
    expect(onOrdenar).not.toHaveBeenCalled();
  });

  it('CA-05: renderiza família, quantidade, apresentação e status', () => {
    setup();
    expect(screen.getAllByText('● Imunologia')[0]).toBeInTheDocument();
    expect(screen.getAllByText('42.500')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Blister 28cp · SKU 00312')[0]).toBeInTheDocument();
    expect(screen.getByText('● Aprovado')).toHaveClass('text-apsen-green');
    expect(screen.getByText('Itens do plano de produção')).toBeInTheDocument();
  });

  it('CA-04: cabeçalhos ordenáveis com aria-sort', async () => {
    const { user, onOrdenar } = setup({ ordem: { campo: 'qtd', direcao: 'desc' } });
    const codigo = screen.getByRole('columnheader', { name: 'Código' });
    const qtd = screen.getByRole('columnheader', { name: 'Qtd. Planejada' });
    expect(codigo).toHaveAttribute('aria-sort', 'none');
    expect(qtd).toHaveAttribute('aria-sort', 'descending');
    await user.click(screen.getByRole('button', { name: 'Código' }));
    await user.click(screen.getByRole('button', { name: 'Qtd. Planejada' }));
    expect(onOrdenar.mock.calls).toEqual([['codigo'], ['qtd']]);
  });

  it('CA-06 / RN-03: aprovado só visualiza; pendente edita e exclui', async () => {
    const { user, onExcluir } = setup();
    expect(screen.getByRole('link', { name: 'Visualizar PLP-2026-07-001' })).toHaveAttribute(
      'href',
      '/planos/PLP-2026-07-001',
    );
    expect(screen.queryByRole('link', { name: 'Editar PLP-2026-07-001' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar PLP-2026-07-005' })).toHaveAttribute(
      'href',
      '/planos/uuid-5',
    );
    await user.click(screen.getByRole('button', { name: 'Excluir PLP-2026-07-005' }));
    expect(onExcluir).toHaveBeenCalledWith(PENDENTE);
  });

  it('perfis sem permissão não veem editar/excluir; vazio mostra o texto', () => {
    setup({ podeEditar: false });
    expect(screen.queryByRole('button', { name: /Excluir/ })).not.toBeInTheDocument();
  });

  it('lista vazia', () => {
    setup({ itens: [], ordem: null });
    expect(screen.getByText('Nenhum item encontrado com os filtros atuais.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Selecionar itens da página' })).not.toBeChecked();
  });
});
