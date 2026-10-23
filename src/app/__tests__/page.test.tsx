import { buildDashboard } from '@test/factories';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import DashboardPage, { metadata } from '../page';

describe('app/page', () => {
  it('define o título da rota', () => {
    expect(metadata.title).toBe('Dashboard');
  });

  it('renderiza o dashboard', async () => {
    const useCases = createFakeUseCases({
      getDashboardSummary: { execute: vi.fn().mockResolvedValue(buildDashboard()) },
    });
    renderWithProviders(<DashboardPage />, useCases);
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('Top Um')).toBeInTheDocument();
  });
});
