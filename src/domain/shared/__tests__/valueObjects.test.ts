import { DateRange } from '../DateRange';
import { CampaignNotFoundError, DomainError, InvalidValueError } from '../DomainError';
import { Money } from '../Money';
import { Percentage } from '../Percentage';

describe('Money', () => {
  it('arredonda para centavos', () => {
    expect(Money.of(10.005).amount).toBe(10.01);
    expect(Money.of(0.1).add(Money.of(0.2)).amount).toBe(0.3);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejeita valor inválido %p', (value) => {
    expect(() => Money.of(value)).toThrow(InvalidValueError);
  });

  it('zero é zero', () => {
    expect(Money.zero().isZero()).toBe(true);
    expect(Money.of(1).isZero()).toBe(false);
  });

  it('divide por número positivo e retorna null para divisor zero, negativo ou não finito', () => {
    expect(Money.of(100).divideBy(3)?.amount).toBe(33.33);
    expect(Money.of(100).divideBy(0)).toBeNull();
    expect(Money.of(100).divideBy(-2)).toBeNull();
    expect(Money.of(100).divideBy(Number.NaN)).toBeNull();
  });

  it('calcula razão e trata divisão por zero', () => {
    expect(Money.of(300).ratioTo(Money.of(100))).toBe(3);
    expect(Money.of(300).ratioTo(Money.zero())).toBeNull();
  });

  it('compara igualdade por valor', () => {
    expect(Money.of(1.5).equals(Money.of(1.5))).toBe(true);
    expect(Money.of(1.5).equals(Money.of(1.51))).toBe(false);
  });
});

describe('Percentage', () => {
  it('converte razão em valor percentual', () => {
    expect(Percentage.fromRatio(0.125).value).toBe(12.5);
    expect(Percentage.fromRatio(0.125).ratio).toBe(0.125);
  });

  it.each([-0.1, Number.NaN, Number.POSITIVE_INFINITY])('rejeita razão inválida %p', (ratio) => {
    expect(() => Percentage.fromRatio(ratio)).toThrow(InvalidValueError);
  });

  it('cria a partir de fração e retorna null quando denominador é zero', () => {
    expect(Percentage.fromFraction(1, 4)?.value).toBe(25);
    expect(Percentage.fromFraction(1, 0)).toBeNull();
  });
});

describe('DateRange', () => {
  const range = DateRange.fromIso('2026-01-01T00:00:00.000Z', '2026-01-10T00:00:00.000Z');

  it('calcula a quantidade de dias inclusiva', () => {
    expect(range.days).toBe(10);
  });

  it('copia as datas para manter imutabilidade', () => {
    const start = new Date('2026-01-01T00:00:00.000Z');
    const created = DateRange.create(start, new Date('2026-01-02T00:00:00.000Z'));
    start.setUTCFullYear(2000);
    expect(created.start.getUTCFullYear()).toBe(2026);
  });

  it('rejeita datas inválidas ou invertidas', () => {
    expect(() => DateRange.fromIso('x', '2026-01-01')).toThrow(InvalidValueError);
    expect(() => DateRange.fromIso('2026-01-01', 'y')).toThrow(InvalidValueError);
    expect(() => DateRange.fromIso('2026-02-01', '2026-01-01')).toThrow(
      'A data final do período deve ser posterior à inicial',
    );
  });

  it('verifica se contém uma data', () => {
    expect(range.contains(new Date('2026-01-05T00:00:00.000Z'))).toBe(true);
    expect(range.contains(new Date('2026-01-10T00:00:00.000Z'))).toBe(true);
    expect(range.contains(new Date('2026-01-11T00:00:00.000Z'))).toBe(false);
    expect(range.contains(new Date('2025-12-31T00:00:00.000Z'))).toBe(false);
  });

  it('detecta sobreposição de períodos', () => {
    const overlapping = DateRange.fromIso('2026-01-10T00:00:00.000Z', '2026-02-01T00:00:00.000Z');
    const after = DateRange.fromIso('2026-01-11T00:00:00.000Z', '2026-02-01T00:00:00.000Z');
    const before = DateRange.fromIso('2025-12-01T00:00:00.000Z', '2025-12-31T00:00:00.000Z');
    expect(range.overlaps(overlapping)).toBe(true);
    expect(range.overlaps(after)).toBe(false);
    expect(range.overlaps(before)).toBe(false);
  });
});

describe('DomainError', () => {
  it('preserva nome da subclasse e id da campanha', () => {
    const error = new CampaignNotFoundError('cmp-9');
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe('CampaignNotFoundError');
    expect(error.campaignId).toBe('cmp-9');
    expect(error.message).toBe('Campanha cmp-9 não encontrada');
    expect(new InvalidValueError('x').name).toBe('InvalidValueError');
  });
});
