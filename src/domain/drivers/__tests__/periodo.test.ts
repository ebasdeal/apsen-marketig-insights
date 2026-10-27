import { dataFimMaxima, mensagemPeriodo, validarPeriodo } from '../periodo';

describe('dataFimMaxima (RN-04)', () => {
  it('é a mesma data no ano seguinte', () => {
    expect(dataFimMaxima('2026-07-01')).toBe('2027-07-01');
  });

  it('segue o Date.setFullYear em 29/02', () => {
    expect(dataFimMaxima('2024-02-29')).toBe('2025-03-01');
  });

  it('sem início válido não tem máximo', () => {
    expect(dataFimMaxima('')).toBe('');
    expect(dataFimMaxima('01/07/2026')).toBe('');
  });
});

describe('validarPeriodo (RN-05)', () => {
  it.each([
    ['', '2026-07-01', 'ok'],
    ['2026-07-01', '', 'ok'],
    ['2026-07-01', '2026-06-30', 'anterior'],
    ['2026-07-01', '2027-07-02', 'excede'],
    ['2026-07-01', '2027-07-01', 'ok'],
    ['2026-07-01', '2026-07-01', 'ok'],
    ['inválida', 'x', 'ok'],
  ] as const)('início %s e fim %s → %s', (inicio, fim, esperado) => {
    expect(validarPeriodo(inicio, fim)).toBe(esperado);
  });
});

describe('mensagemPeriodo (CA-02)', () => {
  it('devolve os textos do protótipo', () => {
    expect(mensagemPeriodo('anterior')).toBe('⚠️ A data fim não pode ser anterior à data início.');
    expect(mensagemPeriodo('excede')).toBe(
      '⚠️ A data fim não pode ultrapassar 1 ano a partir da data início.',
    );
    expect(mensagemPeriodo('ok')).toBeNull();
  });
});
