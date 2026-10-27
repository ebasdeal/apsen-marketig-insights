import { filtrarSugestoes, LIMITE_SUGESTOES_SEM_TERMO } from '../concorrentes';

const LABS = Array.from({ length: 15 }, (_, i) => `Lab ${i + 1}`);

describe('filtrarSugestoes (RN-11)', () => {
  it('sem termo devolve os 12 primeiros', () => {
    expect(filtrarSugestoes(LABS, '  ')).toHaveLength(LIMITE_SUGESTOES_SEM_TERMO);
    expect(LIMITE_SUGESTOES_SEM_TERMO).toBe(12);
  });

  it('filtra por substring sem diferenciar caixa e mantém a ordem', () => {
    expect(filtrarSugestoes(['Genérico EMS', 'Germed', 'Legrand'], ' GE ')).toEqual([
      'Genérico EMS',
      'Germed',
    ]);
    expect(filtrarSugestoes(['Germed'], 'xyz')).toEqual([]);
  });
});
