import { CampaignNotFoundError } from '@domain/shared/DomainError';
import { buildDashboard, buildDetails, buildListItem } from '@test/factories';
import { createFakeUseCases, createWrapper } from '@test/renderWithProviders';
import { renderHook, waitFor } from '@testing-library/react';
import { INITIAL_CAMPAIGN_FILTERS } from '../../stores/campaignFiltersStore';
import { useUseCases } from '../../providers/UseCasesContext';
import { queryKeys } from '../queryKeys';
import { useCampaignDetails } from '../useCampaignDetails';
import { toListCampaignsInput, useCampaigns } from '../useCampaigns';
import { useDashboardSummary } from '../useDashboardSummary';

describe('toListCampaignsInput', () => {
  const now = new Date('2026-10-22T00:00:00.000Z');

  it('omite filtros não definidos', () => {
    expect(toListCampaignsInput(INITIAL_CAMPAIGN_FILTERS, now)).toEqual({});
  });

  it('inclui canal, status e período resolvido', () => {
    expect(toListCampaignsInput({ channel: 'meta', status: 'ativa', period: 'ytd' }, now)).toEqual({
      channel: 'meta',
      status: 'ativa',
      period: { start: '2026-01-01T00:00:00.000Z', end: '2026-10-22T00:00:00.000Z' },
    });
  });
});

describe('queryKeys', () => {
  it('gera chaves estáveis', () => {
    expect(queryKeys.campaigns).toEqual(['campaigns']);
    expect(queryKeys.campaignList({ channel: 'meta' })).toEqual([
      'campaigns',
      'list',
      { channel: 'meta' },
    ]);
    expect(queryKeys.campaignDetails('x')).toEqual(['campaigns', 'details', 'x']);
    expect(queryKeys.dashboard({})).toEqual(['dashboard', {}]);
  });
});

describe('useCampaigns', () => {
  it('executa o caso de uso com os filtros convertidos', async () => {
    const items = [buildListItem()];
    const useCases = createFakeUseCases({
      listCampaigns: { execute: vi.fn().mockResolvedValue(items) },
    });
    const { result } = renderHook(
      () => useCampaigns({ channel: 'google', status: null, period: 'all' }),
      { wrapper: createWrapper(useCases) },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(items);
    expect(useCases.listCampaigns.execute).toHaveBeenCalledWith({ channel: 'google' });
  });
});

describe('useCampaignDetails', () => {
  it('carrega o detalhe', async () => {
    const details = buildDetails();
    const useCases = createFakeUseCases({
      getCampaignDetails: { execute: vi.fn().mockResolvedValue(details) },
    });
    const { result } = renderHook(() => useCampaignDetails('cmp-1'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.data).toEqual(details));
    expect(useCases.getCampaignDetails.execute).toHaveBeenCalledWith('cmp-1');
  });

  it('não consulta sem id', async () => {
    const useCases = createFakeUseCases();
    const { result } = renderHook(() => useCampaignDetails(''), {
      wrapper: createWrapper(useCases),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(useCases.getCampaignDetails.execute).not.toHaveBeenCalled();
  });

  it('não repete quando a campanha não existe', async () => {
    const execute = vi.fn().mockRejectedValue(new CampaignNotFoundError('x'));
    const useCases = createFakeUseCases({ getCampaignDetails: { execute } });
    const { result } = renderHook(() => useCampaignDetails('x'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('repete uma vez em erros transitórios', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('rede'));
    const useCases = createFakeUseCases({ getCampaignDetails: { execute } });
    const { result } = renderHook(() => useCampaignDetails('x'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(execute).toHaveBeenCalledTimes(2);
  });
});

describe('useDashboardSummary', () => {
  it('consulta sem período no preset "all"', async () => {
    const summary = buildDashboard();
    const useCases = createFakeUseCases({
      getDashboardSummary: { execute: vi.fn().mockResolvedValue(summary) },
    });
    const { result } = renderHook(() => useDashboardSummary('all'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.data).toEqual(summary));
    expect(useCases.getDashboardSummary.execute).toHaveBeenCalledWith({});
  });

  it('envia período resolvido para presets relativos', async () => {
    const useCases = createFakeUseCases({
      getDashboardSummary: { execute: vi.fn().mockResolvedValue(buildDashboard()) },
    });
    const { result } = renderHook(() => useDashboardSummary('30d'), {
      wrapper: createWrapper(useCases),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useCases.getDashboardSummary.execute).toHaveBeenCalledWith({
      period: { start: expect.any(String), end: expect.any(String) },
    });
  });
});

describe('useUseCases', () => {
  it('falha fora do provider', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useUseCases())).toThrow(
      'useUseCases deve ser usado dentro de <UseCasesProvider>',
    );
    vi.mocked(console.error).mockRestore();
  });
});
