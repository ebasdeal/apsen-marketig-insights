import type { Restricao, RestricaoForm } from '../Restricao';
import {
  RESPONSAVEIS,
  RESTRICAO_LABELS,
  RESTRICAO_TIPO_OPCOES,
  RESTRICAO_TIPOS,
  RESTRICOES_POR_PAGINA,
  SEVERIDADE_LABEL,
  SEVERIDADE_OPCOES,
} from '../restricaoConstants';
import { RestricaoInvalidaError } from '../RestricaoInvalidaError';
import {
  alteracoesDaEdicao,
  formularioAlterado,
  formularioDe,
  formularioVazio,
  isoDePrazo,
  novaRestricao,
  prazoDeIso,
  proximoCodigoRestricao,
  resolucaoEm,
  resumoResolucao,
  validarRestricao,
} from '../restricaoRules';

const RESTRICAO: Restricao = {
  id: 'RST-002',
  codigo: 'RST-002',
  tipo: 'capacidade',
  label: '⚙️ Capacidade',
  desc: 'Manutenção programada — Linha 3',
  det: 'Parada para qualificação',
  produto: 'Linha 3',
  impacto: 'Redução 40% cap.',
  impCor: 'atencao',
  prazo: '22–25/07/2026',
  resp: 'Carlos Lima',
  sev: 'atencao',
  status: 'ativa',
  obs: 'Manutenção anual.',
  resolucao: null,
};

function form(overrides: Partial<RestricaoForm> = {}): RestricaoForm {
  return { ...formularioVazio(), ...overrides };
}

function erroDe(fn: () => void): RestricaoInvalidaError {
  try {
    fn();
  } catch (error) {
    if (error instanceof RestricaoInvalidaError) {
      return error;
    }
  }
  throw new Error('esperava RestricaoInvalidaError');
}

describe('constantes de restrições', () => {
  it('expõem rótulos, opções, responsáveis e tamanho de página do protótipo', () => {
    expect(RESTRICAO_TIPOS).toHaveLength(7);
    expect(RESTRICAO_LABELS.capacidade).toBe('⚙️ Capacidade');
    expect(RESTRICAO_TIPO_OPCOES.map((opcao) => opcao.value)).toEqual(RESTRICAO_TIPOS);
    expect(SEVERIDADE_OPCOES[0]).toEqual({
      value: 'critica',
      label: '🔴 Crítica — bloqueio total',
    });
    expect(SEVERIDADE_LABEL).toEqual({
      critica: 'Crítica',
      atencao: 'Atenção',
      analise: 'Em análise',
    });
    expect(RESPONSAVEIS).toEqual(['Ana Planejadora', 'Carlos Lima', 'Roberto Gerente']);
    expect(RESTRICOES_POR_PAGINA).toBe(10);
  });
});

describe('proximoCodigoRestricao (RN-03)', () => {
  it('soma 1 ao maior sufixo com 3 dígitos', () => {
    expect(proximoCodigoRestricao('RST-022')).toBe('RST-023');
    expect(proximoCodigoRestricao('RST-999')).toBe('RST-1000');
  });

  it('sem código ou fora do padrão começa em RST-001', () => {
    expect(proximoCodigoRestricao(null)).toBe('RST-001');
    expect(proximoCodigoRestricao('ABC')).toBe('RST-001');
  });
});

describe('validarRestricao (RN-04)', () => {
  it('sem tipo e sem descrição acusa primeiro o tipo', () => {
    const erro = erroDe(() => validarRestricao(form()));
    expect(erro.message).toBe('⚠️ Selecione o tipo.');
    expect(erro.campo).toBe('tipo');
  });

  it('com tipo e descrição em branco acusa a descrição', () => {
    const erro = erroDe(() => validarRestricao(form({ tipo: 'mp', desc: ' ' })));
    expect(erro.message).toBe('⚠️ Informe a descrição.');
    expect(erro.campo).toBe('desc');
    expect(erro.name).toBe('RestricaoInvalidaError');
  });

  it('aceita tipo e descrição preenchidos', () => {
    expect(() => validarRestricao(form({ tipo: 'mp', desc: 'Falta' }))).not.toThrow();
  });
});

describe('prazos', () => {
  it('converte ISO para dd/mm/aaaa por texto; vazio ou inválido vira "—"', () => {
    expect(prazoDeIso('2026-08-15')).toBe('15/08/2026');
    expect(prazoDeIso('')).toBe('—');
    expect(prazoDeIso('15/08/2026')).toBe('—');
  });

  it('converte dd/mm/aaaa para ISO; outro formato vira vazio', () => {
    expect(isoDePrazo('05/07/2026')).toBe('2026-07-05');
    expect(isoDePrazo('22–25/07/2026')).toBe('');
    expect(isoDePrazo('—')).toBe('');
  });
});

describe('novaRestricao (RN-05)', () => {
  it('monta o registro ativo com label curto, impCor = sev e prazo formatado', () => {
    const nova = novaRestricao(
      {
        ...form({ sev: 'atencao', desc: '  Parada da Linha 4 ', prazoIso: '2026-08-15' }),
        tipo: 'capacidade',
      },
      'uuid-1',
      'RST-023',
    );
    expect(nova).toMatchObject({
      id: 'uuid-1',
      codigo: 'RST-023',
      label: '⚙️ Capacidade',
      desc: 'Parada da Linha 4',
      impCor: 'atencao',
      prazo: '15/08/2026',
      det: '',
      status: 'ativa',
      resp: 'Ana Planejadora',
      resolucao: null,
    });
  });

  it('sem prazo grava "—"', () => {
    const nova = novaRestricao({ ...form({ desc: 'x' }), tipo: 'mp' }, 'id', 'RST-001');
    expect(nova.prazo).toBe('—');
  });
});

describe('alteracoesDaEdicao (RN-06)', () => {
  const edicao = { ...formularioDe(RESTRICAO), tipo: 'demanda' as const, sev: 'critica' as const };

  it('preserva prazo fora do padrão quando o campo fica vazio', () => {
    expect(isoDePrazo(RESTRICAO.prazo)).toBe('');
    const patch = alteracoesDaEdicao(RESTRICAO, edicao);
    expect(patch).toEqual({
      tipo: 'demanda',
      label: '📈 Demanda',
      desc: RESTRICAO.desc,
      produto: RESTRICAO.produto,
      impacto: RESTRICAO.impacto,
      impCor: 'critica',
      prazo: '22–25/07/2026',
      resp: RESTRICAO.resp,
      sev: 'critica',
      obs: RESTRICAO.obs,
    });
  });

  it('substitui o prazo quando informado e limpa para "—" quando o original era dd/mm/aaaa', () => {
    expect(alteracoesDaEdicao(RESTRICAO, { ...edicao, prazoIso: '2026-07-30' }).prazo).toBe(
      '30/07/2026',
    );
    expect(alteracoesDaEdicao({ prazo: '05/07/2026' }, edicao).prazo).toBe('—');
  });
});

describe('resolução', () => {
  it('formata a data local (RN-07)', () => {
    expect(resolucaoEm(new Date(2026, 9, 27, 23, 59))).toBe('Resolvida em 27/10/2026');
    expect(resolucaoEm(new Date(2026, 0, 5))).toBe('Resolvida em 05/01/2026');
  });

  it('resume em 40 caracteres (RN-08)', () => {
    const longa = 'Reparo concluído. 52h de parada total. Produção compensada em turno extra.';
    expect(resumoResolucao({ resolucao: longa })).toBe(longa.slice(0, 40));
    expect(resumoResolucao({ resolucao: null })).toBe('');
  });
});

describe('formulários', () => {
  it('vazio tem severidade crítica e responsável padrão', () => {
    expect(formularioVazio()).toEqual({
      tipo: '',
      sev: 'critica',
      desc: '',
      produto: '',
      impacto: '',
      prazoIso: '',
      resp: 'Ana Planejadora',
      obs: '',
    });
  });

  it('formularioDe pré-preenche todos os campos', () => {
    expect(formularioDe({ ...RESTRICAO, prazo: '05/07/2026' })).toEqual({
      tipo: 'capacidade',
      sev: 'atencao',
      desc: RESTRICAO.desc,
      produto: 'Linha 3',
      impacto: 'Redução 40% cap.',
      prazoIso: '2026-07-05',
      resp: 'Carlos Lima',
      obs: 'Manutenção anual.',
    });
  });

  it('formularioAlterado compara campo a campo', () => {
    expect(formularioAlterado(formularioVazio(), formularioVazio())).toBe(false);
    expect(formularioAlterado(formularioVazio(), form({ obs: 'x' }))).toBe(true);
  });
});
