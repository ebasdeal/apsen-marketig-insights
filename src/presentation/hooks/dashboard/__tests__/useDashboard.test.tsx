import {
  createFakeUseCases,
  createTestQueryClient,
  createWrapper,
} from '@test/renderWithProviders';
import { renderHook, waitFor } from '@testing-library/react';
import { queryKeys } from '../../queryKeys';
import { dashboardKeys } from '../dashboardKeys';
import { useDashboardOverview } from '../useDashboard';

describe('useDashboardOverview', () => {
  it('usa o prefixo ["dashboard"] e refaz a carga após invalidar (CA-09)', async () => {
    const useCases = createFakeUseCases();
    const queryClient = createTestQueryClient();
    const wrapper = createWrapper(useCases, queryClient);
    expect(queryKeys.dashboard).toBe(dashboardKeys);
    expect(dashboardKeys.overview()).toEqual(['dashboard', 'overview']);
    const { result, unmount } = renderHook(() => useDashboardOverview(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    unmount();
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    renderHook(() => useDashboardOverview(), { wrapper });
    await waitFor(() => expect(useCases.dashboard.overview.execute).toHaveBeenCalledTimes(2));
  });
});
