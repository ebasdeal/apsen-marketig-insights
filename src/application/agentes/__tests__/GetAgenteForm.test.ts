import { NotFoundError } from '@domain/shared/DomainError';
import { createFakeAgenteRepository } from '@test/fakes/acessoRepositories';
import { AGENTE_FORM_FIXTURE, buildAgente } from '@test/fixtures/agentes';
import { GetAgenteForm } from '../GetAgenteForm';

describe('GetAgenteForm (CA-10)', () => {
  it('dado AG-003, quando executa, então schedule extra', async () => {
    const repository = createFakeAgenteRepository();
    const form = await new GetAgenteForm(repository).execute('AG-003');
    expect(repository.get).toHaveBeenCalledWith('AG-003');
    expect(form.extras).toEqual({ schedule: 'H24 · a cada 6h' });
    expect(form.draft.papelOpcao).toBe('📱 Agente Social — Instagram / TikTok / X');
  });

  it('AG-005 vem com ambiente Desenvolvimento e sem extras', async () => {
    const form = await new GetAgenteForm(createFakeAgenteRepository()).execute('AG-005');
    expect(form).toEqual(AGENTE_FORM_FIXTURE);
  });

  it('modelo fora da lista entra como extra', async () => {
    const repository = createFakeAgenteRepository();
    repository.get.mockResolvedValueOnce(buildAgente({ modelo: 'gpt-5' }));
    const form = await new GetAgenteForm(repository).execute('AG-001');
    expect(form.extras).toEqual({ modelo: 'gpt-5' });
  });

  it('404 → NotFoundError', async () => {
    const repository = createFakeAgenteRepository();
    repository.get.mockRejectedValueOnce(new NotFoundError('Agente', 'AG-999'));
    await expect(new GetAgenteForm(repository).execute('AG-999')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
