import { REGRAS_CHAT } from '@test/fixtures/analises';
import type { MensagemChat } from '../Analise';
import { mensagensDoHistorico, regraPadrao, responderChat, ultimaInteracao } from '../chatRules';

const CONTEXTO = { ciclo: 'PLP-2026-07', modelo: 'SARIMAX' };

describe('responderChat (CA-13 / RN-10)', () => {
  it('casa a primeira regra cujo gatilho está na pergunta em minúsculas', () => {
    expect(responderChat('qual o lag?', REGRAS_CHAT, CONTEXTO)).toBe(
      'O lag de +1 mês em campanhas digitais…',
    );
    expect(responderChat('Houve RUPTURA?', REGRAS_CHAT, CONTEXTO)).toBe(
      'Demanda censurada: ruptura…',
    );
    expect(responderChat('Qual a Acurácia?', REGRAS_CHAT, CONTEXTO)).toBe(
      'MAPE de 8.4% = erro médio…',
    );
  });

  it('sem gatilho usa a regra padrão trocando {ciclo} e {modelo}', () => {
    expect(responderChat('Explique o resultado', REGRAS_CHAT, CONTEXTO)).toBe(
      'Com base nesta análise (ciclo PLP-2026-07, modelo SARIMAX): posso detalhar impacto de qualquer driver.',
    );
  });

  it('sem regra padrão devolve texto vazio', () => {
    const semPadrao = REGRAS_CHAT.filter((regra) => regra.gatilhos.length > 0);
    expect(regraPadrao(semPadrao)).toBeUndefined();
    expect(responderChat('nada', semPadrao, CONTEXTO)).toBe('');
  });
});

describe('ultimaInteracao (RN-11)', () => {
  it('pega a última pergunta e a última resposta', () => {
    const mensagens: MensagemChat[] = [
      { papel: 'usuario', texto: 'p1' },
      { papel: 'ia', texto: 'r1' },
      { papel: 'usuario', texto: 'p2' },
      { papel: 'ia', texto: 'r2' },
    ];
    expect(ultimaInteracao(mensagens)).toEqual({ pergunta: 'p2', resposta: 'r2' });
  });

  it('sem pergunta ou sem resposta devolve null', () => {
    expect(ultimaInteracao([])).toBeNull();
    expect(ultimaInteracao([{ papel: 'usuario', texto: 'p1' }])).toBeNull();
    expect(ultimaInteracao([{ papel: 'ia', texto: 'r1' }])).toBeNull();
  });
});

describe('mensagensDoHistorico', () => {
  it('gera usuário + IA por item do histórico', () => {
    expect(
      mensagensDoHistorico([
        { pergunta: 'Por que?', resposta: 'Porque.', ts: null },
        { pergunta: 'E?', resposta: 'Sim.', ts: '01/01/2026 10:00' },
      ]),
    ).toEqual([
      { papel: 'usuario', texto: 'Por que?' },
      { papel: 'ia', texto: 'Porque.' },
      { papel: 'usuario', texto: 'E?' },
      { papel: 'ia', texto: 'Sim.' },
    ]);
  });
});
