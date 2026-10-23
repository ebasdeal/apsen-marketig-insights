import { CampaignNotFoundError } from '@domain/shared/DomainError';
import { toUserMessage } from '../errorMessage';
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatInteger,
  formatPercent,
  formatPeriod,
  formatRoas,
} from '../formatters';

const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('formatters', () => {
  it('formata moeda em BRL e trata nulo', () => {
    expect(normalize(formatCurrency(1234.5))).toBe('R$ 1.234,50');
    expect(formatCurrency(null)).toBe('—');
  });

  it('formata inteiros e números compactos', () => {
    expect(formatInteger(1234567)).toBe('1.234.567');
    expect(normalize(formatCompact(1250000))).toMatch(/^1,3\s?mi/);
  });

  it('formata percentuais e ROAS', () => {
    expect(formatPercent(12.345)).toBe('12,35%');
    expect(formatPercent(null)).toBe('—');
    expect(formatRoas(3.5)).toBe('3,50x');
    expect(formatRoas(null)).toBe('—');
  });

  it('formata datas e períodos em UTC', () => {
    expect(formatDate('2026-03-05T00:00:00.000Z')).toBe('05/03/2026');
    expect(formatPeriod('2026-03-05T00:00:00.000Z', '2026-12-31T00:00:00.000Z')).toBe(
      '05/03/2026 – 31/12/2026',
    );
  });
});

describe('toUserMessage', () => {
  it('traduz erros conhecidos e genéricos', () => {
    expect(toUserMessage(new CampaignNotFoundError('x'))).toBe('Campanha não encontrada.');
    expect(toUserMessage(new Error('boom'))).toMatch(/Não foi possível carregar/);
  });
});
