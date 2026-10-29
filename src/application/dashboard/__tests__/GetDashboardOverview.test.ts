import { buildDashboardOverview } from '@test/fixtures/dashboard';
import { GetDashboardOverview } from '../GetDashboardOverview';

describe('GetDashboardOverview', () => {
  it('monta o DTO da tela a partir do agregado', async () => {
    const repository = { overview: vi.fn().mockResolvedValue(buildDashboardOverview()) };
    const output = await new GetDashboardOverview(repository).execute();
    expect(output).toMatchObject({
      ciclo: 'PLP-2026-07',
      atualizadoEm: '2026-10-27T13:05:00.000Z',
      pipeline: { total: 14, pendentes: 2 },
      restricoes: { ativas: 8, criticas: 3 },
      analises: { total: 2, salvas: 2 },
      plano: { total: 247, aprovados: 107 },
    });
    expect(output.plano.status.map((linha) => [linha.label, linha.n, linha.pct])).toEqual([
      ['Aprovado', 107, 43],
      ['Em Revisão', 70, 28],
      ['Bloqueado', 35, 14],
      ['Pendente', 35, 14],
    ]);
    expect(output.categorias).toHaveLength(6);
    expect(output.categorias[0]).toEqual({
      chave: 'midia',
      label: 'Mídia / Digital',
      n: 3,
      max: 4,
    });
    expect(output.restricoesPorTipo.map((barra) => barra.chave)).toEqual(['mp', 'capacidade']);
    expect(output.pendentes.itens[0]).toEqual({
      id: 'DRV-2026-034',
      produto: 'Baricitinibe 2mg',
      tipo: '💻 Digital / Redes',
    });
    expect(output.pendentes.restantes).toBe(2);
  });

  it('sem ciclo ativo e plano vazio', async () => {
    const repository = {
      overview: vi.fn().mockResolvedValue(
        buildDashboardOverview({
          cicloAtivo: null,
          plano: {
            total: 0,
            aprovados: 0,
            porStatus: { aprovado: 0, revisao: 0, bloqueado: 0, pendente: 0 },
          },
        }),
      ),
    };
    const output = await new GetDashboardOverview(repository).execute();
    expect(output.ciclo).toBeNull();
    expect(output.plano.status.every((linha) => linha.pct === null)).toBe(true);
  });

  it('propaga a falha do repositório', async () => {
    const repository = { overview: vi.fn().mockRejectedValue(new Error('rede')) };
    await expect(new GetDashboardOverview(repository).execute()).rejects.toThrow('rede');
  });
});
