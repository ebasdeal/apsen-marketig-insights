import { createFakeAgenteRepository } from '@test/fakes/acessoRepositories';
import { GetAgentesResumo, montarAgentesResumo } from '../GetAgentesResumo';

describe('GetAgentesResumo (RN-01)', () => {
  it('dado totais e ativos, quando executa, então textos com a próxima execução', async () => {
    const repository = createFakeAgenteRepository();
    const resumo = await new GetAgentesResumo(repository).execute();
    expect(repository.listPage).toHaveBeenCalledWith({ page: 1, size: 1 });
    expect(repository.listAtivos).toHaveBeenCalledTimes(1);
    expect(resumo).toMatchObject({
      total: 5,
      ativos: 3,
      proxima: { nome: 'Agente Regulatório', hora: '03h00' },
      resumoTexto: '5 agentes cadastrados · 3 ativos',
      alertaTexto:
        '5 agentes cadastrados · 3 ativos — próxima execução: Agente Regulatório em 03h00',
    });
    expect(resumo.agendados.map((agente) => agente.id)).toEqual(['AG-001', 'AG-002', 'AG-003']);
  });

  it('sem agentes: nenhuma execução agendada', () => {
    expect(montarAgentesResumo(0, 0, [])).toEqual({
      total: 0,
      ativos: 0,
      agendados: [],
      proxima: null,
      resumoTexto: '0 agentes cadastrados · 0 ativos',
      alertaTexto: '0 agentes cadastrados · 0 ativos — nenhuma execução agendada',
    });
  });
});
