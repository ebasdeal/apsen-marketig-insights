import { aprovacaoFixture } from '@test/fixtures/aprovacoes';
import {
  aplicarDecisao,
  deltaPendentes,
  estadoDaDecisao,
  formatDataBr,
  formatPeriodo,
  pluralPendentes,
  resumoTexto,
  validateRejeicao,
} from '../aprovacaoRules';
import { AprovacaoEmUsoError, EM_USO_MENSAGEM, RejeicaoValidationError } from '../errors';

describe('formatação (RN-02, RN-03)', () => {
  it('formata datas e período, com fim 2099-12-31 permanente', () => {
    expect(formatDataBr('2026-06-20')).toBe('20/06/2026');
    expect(formatPeriodo({ ini: '2026-06-18', fim: '2099-12-31' })).toBe('18/06/2026 → Permanente');
    expect(formatPeriodo({ ini: '2026-07-01', fim: '2026-07-31' })).toBe('01/07/2026 → 31/07/2026');
  });

  it('pluraliza registros e pendentes', () => {
    expect(resumoTexto(1, 1)).toEqual({
      registros: '1 registro encontrado',
      pendentes: '1 pendente',
    });
    expect(resumoTexto(14, 2)).toEqual({
      registros: '14 registros encontrados',
      pendentes: '2 pendentes',
    });
    expect(resumoTexto(0, 0)).toEqual({ registros: '0 registros encontrados', pendentes: null });
    expect(pluralPendentes(1)).toBe('1 pendente');
    expect(pluralPendentes(0)).toBe('0 pendentes');
  });
});

describe('validateRejeicao (RN-05)', () => {
  it('exige motivo e justificativa, espaços contam como vazio', () => {
    expect(validateRejeicao({ motivo: '', justificativa: '   ' })).toEqual({
      motivo: '⚠️ Selecione o motivo da rejeição.',
      justificativa: '⚠️ Informe a justificativa.',
    });
    expect(validateRejeicao({ motivo: 'Outro', justificativa: ' ' })).toEqual({
      justificativa: '⚠️ Informe a justificativa.',
    });
    expect(validateRejeicao({ motivo: 'Outro', justificativa: 'ok' })).toEqual({});
  });

  it('erros carregam campos e mensagem', () => {
    const erro = new RejeicaoValidationError({ motivo: 'm' }, 'm');
    expect(erro.errors).toEqual({ motivo: 'm' });
    expect(erro.name).toBe('RejeicaoValidationError');
    expect(new AprovacaoEmUsoError().message).toBe(EM_USO_MENSAGEM);
  });
});

describe('aplicarDecisao (RN-04, RN-06)', () => {
  it('aprova, rejeita e reabre limpando os campos', () => {
    const pendente = aprovacaoFixture('DRV-2026-034');
    const aprovado = aplicarDecisao(pendente, { tipo: 'aprovar' });
    expect(aprovado).toMatchObject({ status: 'aprovado', motivoRejeicao: '' });
    const rejeitado = aplicarDecisao(pendente, {
      tipo: 'rejeitar',
      motivo: ' Outro ',
      justificativa: ' SKU errado. ',
    });
    expect(rejeitado).toMatchObject({
      status: 'rejeitado',
      motivoRejeicao: 'Outro',
      justificativaRejeicao: 'SKU errado.',
      id: 'DRV-2026-034',
    });
    expect(aplicarDecisao(rejeitado, { tipo: 'reabrir' })).toMatchObject({
      status: 'pendente',
      motivoRejeicao: '',
      justificativaRejeicao: '',
    });
    expect(estadoDaDecisao({ tipo: 'reabrir' }).status).toBe('pendente');
  });

  it('calcula a variação de pendentes', () => {
    expect(deltaPendentes('pendente', { tipo: 'aprovar' })).toBe(-1);
    expect(deltaPendentes('aprovado', { tipo: 'reabrir' })).toBe(1);
    expect(deltaPendentes('pendente', { tipo: 'reabrir' })).toBe(0);
    expect(deltaPendentes('aprovado', { tipo: 'rejeitar', motivo: 'x', justificativa: 'y' })).toBe(
      0,
    );
  });
});
