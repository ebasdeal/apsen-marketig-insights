import { createFakeAgenteRepository } from '@test/fakes/acessoRepositories';
import { conexaoFalhaToast, testandoToast } from '../agenteToasts';
import { TestarAgente } from '../TestarAgente';

describe('TestarAgente (RN-08, CA-04)', () => {
  it('dado um agente, quando executa, então grava ok com o horário do relógio', async () => {
    const repository = createFakeAgenteRepository();
    const now = () => new Date(2026, 9, 27, 14, 5);
    const result = await new TestarAgente(repository, now).execute({
      id: 'AG-001',
      papel: '🏛️ Agente Regulatório',
    });
    const ultimoTeste = { status: 'ok', ts: '27/10/2026 14:05' };
    expect(repository.update).toHaveBeenCalledWith('AG-001', { ultimoTeste });
    expect(result).toEqual({ toast: '✅ Conexão OK — 🏛️ Agente', ultimoTeste });
  });

  it('textos de início e falha usam o papel curto', () => {
    expect(testandoToast('🏛️ Agente Regulatório')).toBe('⟳ Testando 🏛️ Agente...');
    expect(conexaoFalhaToast('🏛️ Agente Regulatório')).toBe('❌ Falha ao conectar — 🏛️ Agente');
  });
});
