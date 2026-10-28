import { restricaoItemFixture } from '@test/fakes/restricoes';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestricoesTable } from '../components/RestricoesTable';

const ATENCAO = restricaoItemFixture({
  id: 'RST-002',
  desc: 'Manutenção — Linha 3',
  impacto: 'Redução 40% cap.',
  impCor: 'atencao',
  sev: 'atencao',
  sevLabel: 'Atenção',
  prazo: '22–25/07/2026',
});

describe('RestricoesTable', () => {
  it('CA-04 / RN-09: colunas, cores e pill das ativas', async () => {
    const onEditar = vi.fn();
    const onResolver = vi.fn();
    const critica = restricaoItemFixture();
    render(
      <RestricoesTable
        aba="ativas"
        itens={[critica, ATENCAO]}
        onEditar={onEditar}
        onResolver={onResolver}
      />,
    );
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'Tipo',
      'Descrição',
      'Produto / Linha',
      'Impacto',
      'Prazo',
      'Responsável',
      'Status',
      'Ações',
    ]);
    headers.forEach((h) => expect(h).toHaveAttribute('scope', 'col'));
    expect(screen.getByText('Bloqueio total')).toHaveClass('text-apsen-red');
    expect(screen.getByText('Redução 40% cap.')).toHaveClass('text-apsen-attention');
    expect(screen.getByText('05/07/2026')).toHaveClass('text-apsen-red');
    expect(screen.getByText('22–25/07/2026')).toHaveClass('text-apsen-slate');
    expect(screen.getByText('● Crítica')).toBeInTheDocument();
    expect(screen.getByText('Restrições ativas')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: `Editar ${critica.desc}` }));
    await user.click(screen.getByRole('button', { name: `Marcar ${ATENCAO.desc} como resolvida` }));
    expect(onEditar).toHaveBeenCalledWith(critica);
    expect(onResolver).toHaveBeenCalledWith(ATENCAO);
  });

  it('CA-05 / RN-08: resolvidas mostram o resumo e nenhuma ação', () => {
    const resumo = 'Reparo concluído. 52h de parada total. P';
    render(
      <RestricoesTable
        aba="resolvidas"
        itens={[restricaoItemFixture({ status: 'resolvida', resolucaoResumo: resumo })]}
        onEditar={vi.fn()}
        onResolver={vi.fn()}
      />,
    );
    const linha = screen.getAllByRole('row')[1] as HTMLElement;
    expect(within(linha).getByText(resumo)).toBeInTheDocument();
    expect(within(linha).getByText('✅ Resolvida')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
    expect(screen.getByText('Restrições resolvidas')).toBeInTheDocument();
  });
});
