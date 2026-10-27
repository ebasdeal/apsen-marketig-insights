import { InvalidValueError } from '../../shared/DomainError';
import type { CicloDraft } from '../Ciclo';
import { CicloValidationError } from '../CicloValidationError';
import {
  RESPONSAVEIS_CICLO,
  defaultPeriodo,
  firstError,
  formatDateBr,
  formatPeriodo,
  mesAno,
  metaCriado,
  metaEncerrado,
  nextCicloCodigo,
  parseCicloCodigo,
  validateCicloDraft,
} from '../cicloRules';

const HOJE = new Date(2026, 9, 27);

const VALIDO: CicloDraft = {
  descricao: 'Planejamento Agosto 2026',
  inicio: '2026-08-01',
  fim: '2026-08-31',
  responsavel: 'Ana Planejadora',
  ativar: false,
};

describe('nextCicloCodigo (RN-05)', () => {
  it('soma um mês ao maior código', () => {
    expect(nextCicloCodigo(['PLP-2026-05', 'PLP-2026-07', 'PLP-2026-06'], HOJE)).toBe(
      'PLP-2026-08',
    );
  });

  it('vira o ano depois de dezembro', () => {
    expect(nextCicloCodigo(['PLP-2026-12', 'PLP-2026-03'], HOJE)).toBe('PLP-2027-01');
  });

  it('sem código válido usa o mês de hoje', () => {
    expect(nextCicloCodigo([], HOJE)).toBe('PLP-2026-10');
    expect(nextCicloCodigo(['x', 'PLP-2026-13', 'PLP-2026-00'], new Date(2027, 0, 5))).toBe(
      'PLP-2027-01',
    );
  });

  it('ignora códigos fora do padrão', () => {
    expect(parseCicloCodigo('uuid')).toBeNull();
    expect(parseCicloCodigo('PLP-2026-07')).toEqual({ ano: 2026, mes: 7 });
    expect(nextCicloCodigo(['abc', 'PLP-2026-02'], HOJE)).toBe('PLP-2026-03');
  });
});

describe('defaultPeriodo', () => {
  it('devolve o primeiro e o último dia do mês do código', () => {
    expect(defaultPeriodo('PLP-2026-02')).toEqual({ inicio: '2026-02-01', fim: '2026-02-28' });
    expect(defaultPeriodo('PLP-2028-02')).toEqual({ inicio: '2028-02-01', fim: '2028-02-29' });
    expect(defaultPeriodo('PLP-2026-08')).toEqual({ inicio: '2026-08-01', fim: '2026-08-31' });
  });

  it('recusa código inválido', () => {
    expect(() => defaultPeriodo('X')).toThrow(InvalidValueError);
  });
});

describe('formatação (RN-05)', () => {
  it('gera o período no mesmo ano e entre anos', () => {
    expect(formatPeriodo('2026-07-01', '2026-07-31')).toBe('01/07 → 31/07/2026');
    expect(formatPeriodo('2026-12-15', '2027-01-14')).toBe('15/12/2026 → 14/01/2027');
  });

  it('recusa data fora do ISO', () => {
    expect(() => formatPeriodo('01/07/2026', '2026-07-31')).toThrow(InvalidValueError);
  });

  it('gera as metas de criação e encerramento', () => {
    expect(formatDateBr(new Date(2026, 0, 5))).toBe('05/01/2026');
    expect(metaCriado(HOJE, 1)).toBe('Criado em 27/10/2026 · v1');
    expect(metaEncerrado(HOJE, 2)).toBe('Encerrado em 27/10/2026 · v2');
  });

  it('escreve o mês e o ano por extenso', () => {
    expect(mesAno('2026-07-01')).toBe('Julho 2026');
    expect(mesAno('2027-03-10')).toBe('Março 2027');
    expect(mesAno('2026-13-01')).toBe('13 2026');
  });

  it('espelha os responsáveis da config', () => {
    expect(RESPONSAVEIS_CICLO).toEqual(['Ana Planejadora', 'Carlos Planejador']);
  });
});

describe('validateCicloDraft (RN-04)', () => {
  it('aceita rascunho válido', () => {
    expect(validateCicloDraft(VALIDO)).toEqual({});
    expect(validateCicloDraft({ ...VALIDO, fim: VALIDO.inicio })).toEqual({});
  });

  it('devolve as mensagens por campo', () => {
    const errors = validateCicloDraft({ ...VALIDO, descricao: '   ', inicio: '', fim: '' });
    expect(errors).toEqual({
      descricao: '⚠️ Informe a descrição.',
      inicio: '⚠️ Informe a data de início.',
      fim: '⚠️ Informe a data fim.',
    });
    expect(firstError(errors)).toBe('⚠️ Informe a descrição.');
    expect(firstError(errors, ['fim', 'inicio'])).toBe('⚠️ Informe a data fim.');
  });

  it('recusa fim anterior ao início', () => {
    expect(validateCicloDraft({ ...VALIDO, fim: '2026-07-31' })).toEqual({
      fim: '⚠️ A data fim não pode ser anterior à data início.',
    });
  });

  it('firstError sem erros devolve undefined', () => {
    expect(firstError({})).toBeUndefined();
  });
});

describe('CicloValidationError', () => {
  it('guarda os erros e usa a primeira mensagem', () => {
    const error = new CicloValidationError({ fim: 'b', descricao: 'a' });
    expect(error.message).toBe('a');
    expect(error.errors).toEqual({ fim: 'b', descricao: 'a' });
    expect(error.name).toBe('CicloValidationError');
    expect(new CicloValidationError({}).message).toBe('Ciclo inválido.');
  });
});
