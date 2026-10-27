import { INTENSIDADES } from '@test/factories/drivers';
import { isIntensidade } from '../Driver';
import {
  DICA_UPLIFT_MANUAL,
  dicaUplift,
  infoIntensidade,
  legendaIntensidade,
  upliftSugerido,
} from '../intensidade';

describe('intensidade (RN-12, CA-09)', () => {
  it('sugere o uplift padrão da intensidade', () => {
    expect(upliftSugerido(1, INTENSIDADES)).toBe('2');
    expect(upliftSugerido(4, INTENSIDADES)).toBe('22');
    expect(upliftSugerido(4, [])).toBe('');
  });

  it('monta a legenda "{n} — {label}" com faixa e descrição', () => {
    expect(legendaIntensidade(1, INTENSIDADES)).toEqual({
      titulo: '1 — Marginal',
      faixa: '+1% a +3%',
      descricao: 'Efeito quase imperceptível — ação pontual ou local.',
    });
    expect(legendaIntensidade(4, INTENSIDADES)?.titulo).toBe('4 — Alto');
    expect(legendaIntensidade(4, [])).toBeNull();
  });

  it('dica do uplift: sugerida ou manual', () => {
    expect(dicaUplift(false, infoIntensidade(1, INTENSIDADES))).toBe(
      'Sugerido pela intensidade (+1% a +3%) — ajuste se necessário.',
    );
    expect(dicaUplift(true, infoIntensidade(1, INTENSIDADES))).toBe(DICA_UPLIFT_MANUAL);
    expect(DICA_UPLIFT_MANUAL).toBe('Valor ajustado manualmente.');
    expect(dicaUplift(false, undefined)).toBe('');
  });

  it('isIntensidade aceita só inteiros de 1 a 5', () => {
    expect([0, 1, 3, 5, 6, 2.5].map(isIntensidade)).toEqual([
      false,
      true,
      true,
      true,
      false,
      false,
    ]);
  });
});
