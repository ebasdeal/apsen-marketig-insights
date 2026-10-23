import {
  INITIAL_CAMPAIGN_FILTERS,
  hasActiveFilters,
  useCampaignFiltersStore,
} from '../campaignFiltersStore';
import { THEME_STORAGE_KEY, rehydrateThemePreference, useThemeStore } from '../themeStore';

describe('campaignFiltersStore', () => {
  it('começa sem filtros, sem busca e na página 1', () => {
    const { channel, status, period, search, page } = useCampaignFiltersStore.getState();
    expect({ channel, status, period, search, page }).toEqual(INITIAL_CAMPAIGN_FILTERS);
    expect(INITIAL_CAMPAIGN_FILTERS).toMatchObject({ search: '', page: 1 });
  });

  it('atualiza e reseta filtros', () => {
    const store = useCampaignFiltersStore.getState();
    store.setChannel('tiktok');
    store.setStatus('encerrada');
    store.setPeriod('90d');
    store.setSearch('alfa');
    store.setPage(4);
    expect(useCampaignFiltersStore.getState()).toMatchObject({
      channel: 'tiktok',
      status: 'encerrada',
      period: '90d',
      search: 'alfa',
      page: 4,
    });
    useCampaignFiltersStore.getState().reset();
    expect(useCampaignFiltersStore.getState()).toMatchObject(INITIAL_CAMPAIGN_FILTERS);
  });

  it('volta para a página 1 ao mudar qualquer filtro', () => {
    const changes = [
      () => useCampaignFiltersStore.getState().setChannel('meta'),
      () => useCampaignFiltersStore.getState().setStatus('ativa'),
      () => useCampaignFiltersStore.getState().setPeriod('ytd'),
      () => useCampaignFiltersStore.getState().setSearch('x'),
    ];
    changes.forEach((change) => {
      useCampaignFiltersStore.getState().setPage(3);
      change();
      expect(useCampaignFiltersStore.getState().page).toBe(1);
    });
  });

  it('detecta filtros ativos', () => {
    expect(hasActiveFilters(INITIAL_CAMPAIGN_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...INITIAL_CAMPAIGN_FILTERS, channel: 'meta' })).toBe(true);
    expect(hasActiveFilters({ ...INITIAL_CAMPAIGN_FILTERS, status: 'ativa' })).toBe(true);
    expect(hasActiveFilters({ ...INITIAL_CAMPAIGN_FILTERS, period: 'ytd' })).toBe(true);
    expect(hasActiveFilters({ ...INITIAL_CAMPAIGN_FILTERS, search: 'alfa' })).toBe(true);
    expect(hasActiveFilters({ ...INITIAL_CAMPAIGN_FILTERS, search: '   ' })).toBe(false);
  });
});

describe('themeStore', () => {
  it('alterna entre sistema, claro e escuro', () => {
    expect(useThemeStore.getState().preference).toBe('system');
    useThemeStore.getState().cycle();
    expect(useThemeStore.getState().preference).toBe('light');
    useThemeStore.getState().cycle();
    expect(useThemeStore.getState().preference).toBe('dark');
    useThemeStore.getState().cycle();
    expect(useThemeStore.getState().preference).toBe('system');
  });

  it('define preferência explicitamente', () => {
    useThemeStore.getState().setPreference('dark');
    expect(useThemeStore.getState().preference).toBe('dark');
  });

  it('persiste somente a preferência no localStorage', () => {
    useThemeStore.getState().setPreference('light');
    const stored = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'null');
    expect(THEME_STORAGE_KEY).toBe('marketing-insights:theme');
    expect(stored.state).toEqual({ preference: 'light' });
  });

  it('restaura a preferência salva ao reidratar', async () => {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({ state: { preference: 'dark' }, version: 0 }),
    );
    rehydrateThemePreference();
    await vi.waitFor(() => expect(useThemeStore.getState().preference).toBe('dark'));
    expect(typeof useThemeStore.getState().cycle).toBe('function');
  });
});
