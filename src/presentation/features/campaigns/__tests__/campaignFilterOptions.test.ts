import {
  ALL_OPTION,
  CHANNEL_SELECT_OPTIONS,
  PERIOD_SELECT_OPTIONS,
  STATUS_SELECT_OPTIONS,
  fromSelectValue,
  toSelectValue,
} from '../campaignFilterOptions';

describe('campaignFilterOptions', () => {
  it('lista canais, status e períodos no tom do protótipo', () => {
    expect(CHANNEL_SELECT_OPTIONS.map((option) => option.label)).toEqual([
      'Todos os canais',
      'Google Ads',
      'Meta Ads',
      'LinkedIn Ads',
      'E-mail',
      'TikTok Ads',
    ]);
    expect(STATUS_SELECT_OPTIONS.map((option) => option.label)).toEqual([
      'Todos os status',
      '● Ativa',
      '● Pausada',
      '● Encerrada',
    ]);
    expect(PERIOD_SELECT_OPTIONS.map((option) => option.value)).toEqual([
      'all',
      '30d',
      '90d',
      'ytd',
    ]);
    expect(CHANNEL_SELECT_OPTIONS[0]?.value).toBe(ALL_OPTION);
  });

  it('converte nulo em "todos" e de volta', () => {
    expect(toSelectValue(null)).toBe('');
    expect(toSelectValue('meta')).toBe('meta');
    expect(fromSelectValue('')).toBeNull();
    expect(fromSelectValue('ativa')).toBe('ativa');
  });
});
