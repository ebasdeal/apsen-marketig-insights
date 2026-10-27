import { AGENTES_FIXTURE } from '@test/fixtures/agentes';
import type { AgenteDraft } from '../Agente';
import {
  AGENTE_MENSAGENS,
  alertaAgentes,
  ambienteDoSelect,
  ambientePillLabel,
  ambienteTone,
  formatTs,
  modelosConhecidos,
  nextAgenteCodigo,
  novoAgenteDraft,
  opcaoDoPapel,
  optionsComExtra,
  papelCurto,
  papelDaOpcao,
  proximaExecucao,
  resumoAgentes,
  validateAgenteDraft,
} from '../agenteRules';
import { AgenteValidationError } from '../errors';
import { AGENTE_PAPEIS, AGENTE_SCHEDULES } from '../vocabulario';

const VALIDO: AgenteDraft = {
  papelOpcao: '➕ Agente customizado',
  nome: 'Agente Preços — Homologação',
  provedor: 'openai',
  ambiente: 'Homologação',
  endpoint: 'https://api.openai.com',
  vault: 'https://apsen-keyvault.vault.azure.net',
  secret: 'apsen-di-precos-key',
  modelo: 'gpt-4o',
  schedule: 'Diário · 03h00',
  fontes: 'https://www.gov.br/anvisa',
  limiar: 80,
  ativo: false,
};

describe('papel e ambiente (RN-02, RN-06)', () => {
  it('papel curto são as duas primeiras palavras com o emoji', () => {
    expect(papelCurto('🏛️ Agente Regulatório')).toBe('🏛️ Agente');
  });

  it('"Dev" aparece como "Desenvolvimento" no select', () => {
    expect(ambienteDoSelect('Dev')).toBe('Desenvolvimento');
    expect(ambienteDoSelect('Produção')).toBe('Produção');
  });

  it('pill: Produção vermelha, Homologação amarela, demais verde "Dev"', () => {
    expect([ambienteTone('Produção'), ambientePillLabel('Produção')]).toEqual(['red', 'Produção']);
    expect([ambienteTone('Homologação'), ambientePillLabel('Homologação')]).toEqual([
      'yellow',
      'Homologação',
    ]);
    expect([ambienteTone('Desenvolvimento'), ambientePillLabel('Desenvolvimento')]).toEqual([
      'green',
      'Dev',
    ]);
    expect(ambientePillLabel('Dev')).toBe('Dev');
  });
});

describe('próxima execução e textos (RN-01, RN-07)', () => {
  it('dado os ativos da massa, então Agente Regulatório às 03h00', () => {
    expect(proximaExecucao(AGENTES_FIXTURE)).toEqual({ nome: 'Agente Regulatório', hora: '03h00' });
  });

  it('escolhe o menor horário independente da ordem e ignora inativos', () => {
    const [regulatorio, concorrencia, , , macro] = AGENTES_FIXTURE;
    const lista = [
      { ...macro!, ativo: true },
      { ...concorrencia! },
      { ...regulatorio!, ativo: false },
    ];
    expect(proximaExecucao(lista)).toEqual({ nome: 'Agente Concorrência', hora: '04h00' });
  });

  it('só "H24 · a cada 6h" → null', () => {
    expect(proximaExecucao([AGENTES_FIXTURE[2]!])).toBeNull();
    expect(proximaExecucao([])).toBeNull();
  });

  it('resumo e alerta', () => {
    expect(resumoAgentes(5, 3)).toBe('5 agentes cadastrados · 3 ativos');
    expect(alertaAgentes(5, 3, { nome: 'Agente Regulatório', hora: '03h00' })).toBe(
      '5 agentes cadastrados · 3 ativos — próxima execução: Agente Regulatório em 03h00',
    );
    expect(alertaAgentes(0, 0, null)).toBe(
      '0 agentes cadastrados · 0 ativos — nenhuma execução agendada',
    );
  });
});

describe('códigos e opções (RN-05)', () => {
  it('dado AG-001…AG-005, então AG-006', () => {
    expect(nextAgenteCodigo(['AG-001', 'AG-005', 'AG-003', 'AG-002', 'AG-004'])).toBe('AG-006');
    expect(nextAgenteCodigo([])).toBe('AG-001');
    expect(nextAgenteCodigo(['e7d4-uuid', 'AG-0999'])).toBe('AG-1000');
  });

  it('opção ↔ papel ida e volta para os papéis da massa', () => {
    AGENTES_FIXTURE.forEach(({ papel }) => {
      const opcao = opcaoDoPapel(papel);
      expect(AGENTE_PAPEIS).toContain(opcao);
      expect(papelDaOpcao(opcao)).toBe(papel);
    });
    expect(papelDaOpcao('➕ Agente customizado')).toBe('➕ Agente customizado');
    expect(opcaoDoPapel('🤖 Desconhecido')).toBe('');
  });

  it('valor atual fora da lista entra como opção extra', () => {
    expect(optionsComExtra(AGENTE_SCHEDULES, 'H24 · a cada 6h')).toEqual([
      ...AGENTE_SCHEDULES,
      'H24 · a cada 6h',
    ]);
    expect(optionsComExtra(AGENTE_SCHEDULES, 'Diário · 03h00')).toEqual([...AGENTE_SCHEDULES]);
    expect(optionsComExtra(AGENTE_SCHEDULES, '')).toEqual([...AGENTE_SCHEDULES]);
  });

  it('modelos conhecidos achatam os grupos', () => {
    expect(modelosConhecidos()).toEqual([
      'claude-sonnet-4-6',
      'claude-opus-4-6',
      'claude-haiku-4-5',
      'gpt-4o',
    ]);
  });
});

describe('validateAgenteDraft (RN-04)', () => {
  it('dado rascunho vazio, então as oito mensagens na ordem', () => {
    expect(Object.values(validateAgenteDraft({ ...novoAgenteDraft(), schedule: '' }))).toEqual([
      '⚠️ Selecione o papel do agente.',
      '⚠️ Informe o nome de exibição.',
      '⚠️ Selecione o provedor.',
      '⚠️ Selecione o ambiente.',
      '⚠️ Informe um endpoint https:// válido.',
      '⚠️ Informe a Key Vault URI.',
      '⚠️ Informe o Secret Name.',
      '⚠️ Selecione o modelo padrão.',
    ]);
  });

  it('endpoint "http://x" é inválido', () => {
    expect(validateAgenteDraft({ ...VALIDO, endpoint: 'http://x' })).toEqual({
      endpoint: AGENTE_MENSAGENS.endpoint,
    });
  });

  it('rascunho válido não tem erros', () => {
    expect(validateAgenteDraft(VALIDO)).toEqual({});
  });

  it('AgenteValidationError usa o primeiro erro como mensagem', () => {
    expect(new AgenteValidationError({ nome: AGENTE_MENSAGENS.nome }).message).toBe(
      AGENTE_MENSAGENS.nome,
    );
    expect(new AgenteValidationError({}).message).toBe('Agente inválido.');
  });
});

describe('formatTs e rascunho novo', () => {
  it('formata dd/mm/aaaa HH:MM', () => {
    expect(formatTs(new Date(2026, 9, 27, 14, 5))).toBe('27/10/2026 14:05');
    expect(formatTs(new Date(2026, 0, 3, 3, 9))).toBe('03/01/2026 03:09');
  });

  it('rascunho novo: primeiro schedule, limiar 75, inativo', () => {
    expect(novoAgenteDraft()).toMatchObject({
      schedule: 'Diário · 03h00',
      limiar: 75,
      ativo: false,
      provedor: '',
    });
  });
});
