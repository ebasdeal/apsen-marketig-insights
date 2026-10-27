import { FonteProtegidaError } from '@domain/fontes/errors';
import { FONTE_CUSTOM, FONTES_FIXTURE } from '@test/fixtures/fontes';
import { FakeFonteRepository } from '@test/fakes/fonteRepository';
import { DeleteFonte } from '../DeleteFonte';

describe('DeleteFonte (RN-02)', () => {
  it('recusa fonte fixa', async () => {
    const repository = new FakeFonteRepository(FONTES_FIXTURE);
    await expect(
      new DeleteFonte(repository).execute({ id: 'concorrentes', removivel: false }),
    ).rejects.toBeInstanceOf(FonteProtegidaError);
    expect(repository.calls).toEqual([]);
  });

  it('remove a personalizada', async () => {
    const repository = new FakeFonteRepository([...FONTES_FIXTURE, FONTE_CUSTOM]);
    await expect(
      new DeleteFonte(repository).execute({ id: FONTE_CUSTOM.id, removivel: true }),
    ).resolves.toEqual({ toast: 'Fonte removida.' });
    expect(repository.calls).toEqual([['delete', FONTE_CUSTOM.id]]);
    expect(repository.fontes).toHaveLength(4);
  });
});
