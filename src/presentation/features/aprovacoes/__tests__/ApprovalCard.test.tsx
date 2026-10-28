import { toAprovacaoCardDto } from '@application/aprovacoes/dto';
import { aprovacaoFixture } from '@test/fixtures/aprovacoes';
import { renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { ApprovalCard } from '../components/ApprovalCard';

function renderCard(id: string, emUso: boolean, justificativa = '') {
  const item = { ...aprovacaoFixture(id), justificativaRejeicao: justificativa };
  const acoes = { onAprovar: vi.fn(), onRejeitar: vi.fn(), onReabrir: vi.fn() };
  const view = renderWithProviders(
    <ul>
      <ApprovalCard card={toAprovacaoCardDto(item, emUso)} {...acoes} />
    </ul>,
  );
  return { ...view, acoes, card: screen.getByRole('listitem', { name: id }) };
}

describe('ApprovalCard — CA-04 CA-07', () => {
  it('pendente: botões Aprovar e Rejeitar', async () => {
    const { card, acoes, user } = renderCard('DRV-2026-034', false);
    expect(within(card).getByText('Por SKU')).toBeInTheDocument();
    expect(within(card).getByText('⚡⚡⚡⚡')).toHaveClass('text-apsen-orange');
    expect(
      within(card).getByText('Registrado por Fernanda Marketing · 20/06/2026'),
    ).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Aprovar DRV-2026-034' }));
    await user.click(within(card).getByRole('button', { name: 'Rejeitar DRV-2026-034' }));
    expect(acoes.onAprovar).toHaveBeenCalledWith('DRV-2026-034');
    expect(acoes.onRejeitar).toHaveBeenCalledWith('DRV-2026-034');
    expect(card.className).not.toContain('border-l-[3px]');
  });

  it('aprovado: borda verde', () => {
    const { card } = renderCard('DRV-2026-032', true);
    expect(card).toHaveClass('border-l-apsen-green');
  });

  it('rejeitado em uso: motivo com justificativa e pill sem botão', () => {
    const { card } = renderCard('DRV-2026-028', true, 'Sem confirmação.');
    expect(card).toHaveClass('border-l-apsen-red');
    expect(within(card).getByText(/^Motivo: Período incorreto/)).toHaveTextContent(
      '— Sem confirmação.',
    );
    expect(within(card).getByText('🔒 Em uso no Data Lake — não pode alterar')).toBeInTheDocument();
    expect(within(card).queryByRole('button')).not.toBeInTheDocument();
  });

  it('rejeitado fora de uso: Alterar decisão', async () => {
    const { card, acoes, user } = renderCard('DRV-2026-026', false);
    await user.click(within(card).getByRole('button', { name: 'Alterar decisão de DRV-2026-026' }));
    expect(acoes.onReabrir).toHaveBeenCalledWith('DRV-2026-026');
  });
});

describe('ApprovalCard — autoria da decisão (RN-GOV-02)', () => {
  it('mostra quem decidiu e quando', () => {
    const item = {
      ...aprovacaoFixture('DRV-2026-031'),
      decisao: { tipo: 'aprovado' as const, por: 'Ana P.', em: '2026-10-28T14:05:00.000Z' },
    };
    renderWithProviders(
      <ul>
        <ApprovalCard
          card={toAprovacaoCardDto(item, false)}
          onAprovar={vi.fn()}
          onRejeitar={vi.fn()}
          onReabrir={vi.fn()}
        />
      </ul>,
    );
    expect(screen.getByText('Aprovado por Ana P. em 28/10/2026 14:05')).toBeInTheDocument();
  });
});
