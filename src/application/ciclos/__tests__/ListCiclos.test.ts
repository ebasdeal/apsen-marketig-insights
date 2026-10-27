import { CICLOS_FIXTURE, cicloRow } from '@test/fixtures/ciclos';
import { FakeCicloRepository } from '@test/fakes/cicloRepository';
import { ListCiclos } from '../ListCiclos';

describe('ListCiclos (CA-03)', () => {
  it('pede a página e devolve linhas, total e totalPages', async () => {
    const ciclos = Array.from({ length: 25 }, (_, index) => ({
      ...(CICLOS_FIXTURE[index % 3] as (typeof CICLOS_FIXTURE)[number]),
      id: `id-${index}`,
    }));
    const repository = new FakeCicloRepository(ciclos);
    const result = await new ListCiclos(repository).execute({ page: 2, size: 10 });
    expect(repository.calls).toEqual([['listPage', { page: 2, size: 10 }]]);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.rows).toHaveLength(10);
    expect(result.rows[0]?.id).toBe('id-10');
  });

  it('mapeia as linhas com o código legado igual ao id', async () => {
    const result = await new ListCiclos(new FakeCicloRepository(CICLOS_FIXTURE)).execute({
      page: 1,
      size: 10,
    });
    expect(result.rows).toEqual(CICLOS_FIXTURE.map(cicloRow));
    expect(result.rows[0]).toMatchObject({ id: 'PLP-2026-07', codigo: 'PLP-2026-07' });
    expect(result.totalPages).toBe(1);
  });
});
