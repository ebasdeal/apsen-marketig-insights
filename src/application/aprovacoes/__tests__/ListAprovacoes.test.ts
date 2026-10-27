import { FILTRO_VAZIO } from '@domain/aprovacoes/Aprovacao';
import { createFakeAprovacaoRepository } from '@test/fakes/aprovacaoRepository';
import { aprovacaoFixture } from '@test/fixtures/aprovacoes';
import { aplicarDecisaoNoCard, toAprovacaoCardDto } from '../dto';
import { CountPendentes } from '../CountPendentes';
import { ListAprovacoes } from '../ListAprovacoes';
import { ListEmUso } from '../ListEmUso';

describe('ListAprovacoes (RN-01, CA-02)', () => {
  it('repassa filtro e página, marca em uso e conta pendentes do resultado', async () => {
    const repository = createFakeAprovacaoRepository();
    const filtro = { ...FILTRO_VAZIO, q: 'bari', ini: '2026-01-01' };
    const result = await new ListAprovacoes(repository).execute({ filtro, page: 1 });
    expect(repository.listPage).toHaveBeenCalledWith(filtro, { page: 1, size: 5 });
    expect(repository.countPendentes).toHaveBeenCalledWith({ ...filtro, status: 'pendente' });
    expect(result).toMatchObject({ total: 14, totalPages: 3, pendentesNoResultado: 2 });
    expect(result.cards.map((card) => card.id)).toEqual([
      'DRV-2026-034',
      'DRV-2026-033',
      'DRV-2026-032',
      'DRV-2026-031',
      'DRV-2026-030',
    ]);
    expect(result.cards.find((card) => card.id === 'DRV-2026-032')?.emUso).toBe(true);
    expect(result.cards[0]?.emUso).toBe(false);
  });

  it('status aprovado/rejeitado não consulta pendentes', async () => {
    const repository = createFakeAprovacaoRepository();
    for (const status of ['aprovado', 'rejeitado'] as const) {
      const result = await new ListAprovacoes(repository).execute({
        filtro: { ...FILTRO_VAZIO, status },
        page: 2,
      });
      expect(result.pendentesNoResultado).toBe(0);
    }
    expect(repository.countPendentes).not.toHaveBeenCalled();
  });
});

describe('AprovacaoCardDto (CA-04)', () => {
  it('monta os textos do card', () => {
    expect(toAprovacaoCardDto(aprovacaoFixture('DRV-2026-033'), false)).toEqual({
      id: 'DRV-2026-033',
      modoLabel: 'Por Molécula',
      modoTone: 'purple',
      statusLabel: '⏳ Pendente',
      statusTone: 'yellow',
      meta: 'Registrado por Fernanda Marketing · 20/06/2026',
      produto: 'Baricitinibe (todos os SKUs)',
      molecula: 'Baricitinibe',
      tipo: '🚫 Restrição ANVISA',
      periodo: '18/06/2026 → Permanente',
      intensidadeLabel: '⚡⚡⚡⚡⚡',
      intensidadeTone: 'red',
      params: 'Ato: RDC 212/2026 · Impacto: Restrição de sub-população',
      status: 'pendente',
      motivo: '',
      justificativa: '',
      emUso: false,
    });
    const sku = toAprovacaoCardDto(aprovacaoFixture('DRV-2026-034'), false);
    expect(sku).toMatchObject({
      modoLabel: 'Por SKU',
      modoTone: 'blue',
      periodo: '01/07/2026 → 31/07/2026',
      intensidadeLabel: '⚡⚡⚡⚡',
      intensidadeTone: 'orange',
    });
  });

  it('aplica a decisão no card', () => {
    const card = toAprovacaoCardDto(aprovacaoFixture('DRV-2026-034'), false);
    expect(
      aplicarDecisaoNoCard(card, { tipo: 'rejeitar', motivo: 'Outro', justificativa: 'x' }),
    ).toMatchObject({
      status: 'rejeitado',
      statusLabel: '❌ Rejeitado',
      statusTone: 'red',
      motivo: 'Outro',
      justificativa: 'x',
    });
  });
});

describe('CountPendentes e ListEmUso', () => {
  it('contam a coleção inteira e leem os ids em uso (RN-07)', async () => {
    const repository = createFakeAprovacaoRepository();
    await expect(new CountPendentes(repository).execute()).resolves.toBe(2);
    expect(repository.countPendentes).toHaveBeenCalledWith();
    await expect(new ListEmUso(repository).execute()).resolves.toContain('DRV-2026-028');
  });
});
