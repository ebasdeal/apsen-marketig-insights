import { CICLOS_FIXTURE } from '@test/fixtures/ciclos';
import { FakeCicloRepository } from '@test/fakes/cicloRepository';
import { GetCiclosResumo } from '../GetCiclosResumo';

const now = () => new Date(2026, 9, 27);

describe('GetCiclosResumo (CA-02, RN-01)', () => {
  it('devolve totais, ativo e próximo código', async () => {
    const repository = new FakeCicloRepository(CICLOS_FIXTURE);
    await expect(new GetCiclosResumo(repository, now).execute()).resolves.toEqual({
      total: 3,
      ativos: 1,
      ativo: { id: 'PLP-2026-07', codigo: 'PLP-2026-07', mesAno: 'Julho 2026' },
      proximoCodigo: 'PLP-2026-08',
      proximoPeriodo: { inicio: '2026-08-01', fim: '2026-08-31' },
    });
    expect(repository.calls).toContainEqual(['listPage', { page: 1, size: 1 }]);
  });

  it('sem ativo devolve ativo null', async () => {
    const repository = new FakeCicloRepository(
      CICLOS_FIXTURE.map((ciclo) => ({ ...ciclo, status: 'encerrado' as const })),
    );
    const resumo = await new GetCiclosResumo(repository, now).execute();
    expect(resumo).toMatchObject({ ativo: null, ativos: 0, total: 3 });
  });

  it('sem ciclos usa o mês de hoje', async () => {
    const resumo = await new GetCiclosResumo(new FakeCicloRepository(), now).execute();
    expect(resumo).toMatchObject({ total: 0, proximoCodigo: 'PLP-2026-10' });
    expect(resumo.proximoPeriodo).toEqual({ inicio: '2026-10-01', fim: '2026-10-31' });
  });
});
