import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import DashboardPage, { metadata } from '../page';

describe('app/page', () => {
  it('define o título da rota', () => {
    expect(metadata.title).toBe('Dashboard');
  });

  it('renderiza o Dashboard', async () => {
    renderWithProviders(<DashboardPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard — Demand Intelligence' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Drivers por Categoria')).toBeInTheDocument();
  });
});
