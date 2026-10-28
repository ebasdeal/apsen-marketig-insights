import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { DASHBOARD_API } from '@test/fixtures/dashboard';
import { createDashboardModule } from '../dashboard';

describe('createDashboardModule', () => {
  it('compõe o overview sobre o HttpClient', async () => {
    const { fetchFn } = createFakeFetch({ '/dashboard': { body: DASHBOARD_API } });
    const dashboard = createDashboardModule(
      new FetchHttpClient({ baseUrl: 'http://localhost:3001', fetchFn }),
    );
    await expect(dashboard.overview.execute()).resolves.toMatchObject({
      ciclo: 'PLP-2026-07',
      pipeline: { total: 14 },
    });
  });
});
