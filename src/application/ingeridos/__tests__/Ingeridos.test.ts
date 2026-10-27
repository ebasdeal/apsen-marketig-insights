import type { IngeridoRepository } from '@domain/ingeridos/IngeridoRepository';
import { INGERIDOS } from '@test/fixtures/ingeridos';
import { DeleteIngerido } from '../DeleteIngerido';
import { ListIngeridos } from '../ListIngeridos';

function repositoryCom(itens = INGERIDOS) {
  return {
    listPage: vi.fn(async (_filtro: unknown, { page, size }: { page: number; size: number }) => ({
      items: itens,
      total: itens.length,
      page,
      limit: size,
    })),
    delete: vi.fn(async () => undefined),
  } satisfies IngeridoRepository;
}

describe('ListIngeridos (RN-01, CA-02)', () => {
  it('repassa filtro e página e monta o resumo', async () => {
    const repository = repositoryCom(INGERIDOS.slice(0, 1));
    const result = await new ListIngeridos(repository).execute({
      filtro: { q: 'bari', categoria: 'Supply' },
      page: 1,
    });
    expect(repository.listPage).toHaveBeenCalledWith(
      { q: 'bari', categoria: 'Supply' },
      { page: 1, size: 10 },
    );
    expect(result).toEqual({
      rows: [INGERIDOS[0]],
      total: 1,
      totalPages: 1,
      resumo: '1 driver',
    });
  });

  it('massa completa: 4 drivers', async () => {
    const result = await new ListIngeridos(repositoryCom()).execute({
      filtro: { q: '', categoria: '' },
      page: 1,
    });
    expect(result.resumo).toBe('4 drivers');
    expect(result.rows.find((row) => row.id === 'DRF-2026-027')).toMatchObject({
      idTone: 'teal',
      badge: 'sazo',
      featureTone: 'green',
    });
  });
});

describe('DeleteIngerido (RN-03)', () => {
  it('apaga e devolve o toast', async () => {
    const repository = repositoryCom();
    await expect(new DeleteIngerido(repository).execute('DRV-2026-029')).resolves.toEqual({
      toast: '⚠️ Driver removido.',
    });
    expect(repository.delete).toHaveBeenCalledWith('DRV-2026-029');
  });
});
