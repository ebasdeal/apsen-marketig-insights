import { formatShortPeriod } from '../formatShortPeriod';

describe('formatShortPeriod', () => {
  it('omite o ano do início quando é o mesmo do fim', () => {
    expect(formatShortPeriod('2026-06-01T00:00:00.000Z', '2026-06-30T00:00:00.000Z')).toBe(
      '01/06 → 30/06/2026',
    );
  });

  it('mostra o ano completo nas duas datas quando os anos diferem', () => {
    expect(formatShortPeriod('2025-12-15T00:00:00.000Z', '2026-01-10T00:00:00.000Z')).toBe(
      '15/12/2025 → 10/01/2026',
    );
  });
});
