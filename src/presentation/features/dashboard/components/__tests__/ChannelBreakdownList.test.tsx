import { buildDashboard } from '@test/factories';
import { render, screen, within } from '@testing-library/react';
import { ChannelBreakdownList } from '../ChannelBreakdownList';

describe('ChannelBreakdownList', () => {
  it('renderiza uma barra por canal com rótulo, cor do canal e investimento', () => {
    const { container } = render(<ChannelBreakdownList items={buildDashboard().byChannel} />);
    const rows = within(screen.getByRole('list', { name: 'Canais' })).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute('data-channel', 'google');
    expect(within(rows[0]!).getByText('Google Ads')).toBeInTheDocument();
    expect(within(rows[0]!).getByText(/2\.000,00/)).toBeInTheDocument();
    expect(within(rows[1]!).getByText(/1\.000,00/)).toBeInTheDocument();
    expect(container.querySelector('.bg-apsen-ch-google')).not.toBeNull();
    expect(container.querySelector('.bg-apsen-ch-meta')).not.toBeNull();
  });

  it('dimensiona as barras pelo maior investimento', () => {
    render(<ChannelBreakdownList items={buildDashboard().byChannel} />);
    const google = screen.getByRole('meter', { name: 'Google Ads' });
    expect(google).toHaveAttribute('aria-valuenow', '100');
    expect(google.getAttribute('aria-valuetext')).toMatch(/2\.000,00/);
    expect(screen.getByRole('meter', { name: 'Meta Ads' })).toHaveAttribute('aria-valuenow', '50');
  });

  it('informa quando não há canais', () => {
    render(<ChannelBreakdownList items={[]} />);
    expect(screen.getByText('Nenhum canal no período.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
