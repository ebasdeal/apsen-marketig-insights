import { createFakeAgenteRepository } from '@test/fakes/acessoRepositories';
import { ToggleAgente } from '../ToggleAgente';

describe('ToggleAgente (RN-03, CA-03)', () => {
  it('dado toggle, quando desativa, então PATCH ativo e toast com papel curto', async () => {
    const repository = createFakeAgenteRepository();
    const result = await new ToggleAgente(repository).execute({
      id: 'AG-001',
      papel: '🏛️ Agente Regulatório',
      ativo: false,
    });
    expect(repository.update).toHaveBeenCalledWith('AG-001', { ativo: false });
    expect(result).toEqual({ toast: '⏸ 🏛️ Agente desativado.' });
  });

  it('ativar mostra "ativado."', async () => {
    const result = await new ToggleAgente(createFakeAgenteRepository()).execute({
      id: 'AG-004',
      papel: '📄 Agente Clínico',
      ativo: true,
    });
    expect(result.toast).toBe('✅ 📄 Agente ativado.');
  });
});
