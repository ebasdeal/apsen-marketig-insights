import { render, screen } from '@testing-library/react';
import DashboardPage, { metadata } from '../page';

describe('app/page', () => {
  it('define o título da rota', () => {
    expect(metadata.title).toBe('Dashboard');
  });

  it('renderiza o Dashboard provisório', () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard — Demand Intelligence' }),
    ).toBeInTheDocument();
  });
});
