import { createFakeAgenteRepository } from '@test/fakes/acessoRepositories';
import { ListAgentes } from '../ListAgentes';

describe('ListAgentes (CA-02)', () => {
  it('pagina no servidor e deriva papel curto e pill de ambiente', async () => {
    const repository = createFakeAgenteRepository();
    const result = await new ListAgentes(repository).execute({ page: 1 });
    expect(repository.listPage).toHaveBeenCalledWith({ page: 1, size: 10 });
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(1);
    expect(result.rows[0]).toMatchObject({
      id: 'AG-001',
      papelCurto: '🏛️ Agente',
      ambienteLabel: 'Produção',
      ambienteTone: 'red',
    });
    expect(result.rows[4]).toMatchObject({ ambienteLabel: 'Dev', ambienteTone: 'green' });
  });

  it('respeita o tamanho de página', async () => {
    const repository = createFakeAgenteRepository();
    const result = await new ListAgentes(repository).execute({ page: 2, size: 2 });
    expect(result.rows.map((row) => row.id)).toEqual(['AG-003', 'AG-004']);
    expect(result.totalPages).toBe(3);
  });
});
