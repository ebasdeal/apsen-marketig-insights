import db from '../../../../mock-api/db.json';
import {
  AGENTE_AMBIENTES,
  AGENTE_MODELOS,
  AGENTE_PAPEIS,
  AGENTE_PROVEDORES,
  AGENTE_SCHEDULES,
  LIMIAR_PADRAO,
  SCHEDULE_PADRAO,
} from '../vocabulario';

describe('vocabulário de agentes (§5)', () => {
  const { opcoes } = db.config;

  it('dado o db.json, quando compara, então bate com config.opcoes', () => {
    expect(AGENTE_PAPEIS).toEqual(opcoes.agentePapeis);
    expect(AGENTE_PROVEDORES).toEqual(opcoes.agenteProvedores);
    expect(AGENTE_AMBIENTES).toEqual(opcoes.agenteAmbientes);
    expect(AGENTE_MODELOS).toEqual(opcoes.agenteModelos);
    expect(AGENTE_SCHEDULES).toEqual(opcoes.agenteSchedules);
  });

  it('limiar padrão 75 e schedule padrão o primeiro', () => {
    expect(LIMIAR_PADRAO).toBe(75);
    expect(SCHEDULE_PADRAO).toBe(AGENTE_SCHEDULES[0]);
  });
});
