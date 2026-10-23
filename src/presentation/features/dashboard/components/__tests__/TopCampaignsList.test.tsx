import { buildDashboard } from '@test/factories';
import { render, screen, within } from '@testing-library/react';
import { TopCampaignsList } from '../TopCampaignsList';

describe('TopCampaignsList', () => {
  it('lista as campanhas em ordem com código, canal, ROAS e link para o detalhe', () => {
    render(<TopCampaignsList campaigns={buildDashboard().topCampaigns} />);
    const items = within(screen.getByRole('list', { name: 'Top campanhas' })).getAllByRole(
      'listitem',
    );
    expect(items).toHaveLength(2);
    const first = screen.getByRole('link', { name: 'Abrir campanha Top Um' });
    expect(first).toHaveAttribute('href', '/campaigns/cmp-1');
    expect(within(first).getByText('cmp-1')).toBeInTheDocument();
    expect(within(first).getByText('Top Um')).toBeInTheDocument();
    expect(within(first).getByText('5,00x')).toBeInTheDocument();
    const second = screen.getByRole('link', { name: 'Abrir campanha Top Dois' });
    expect(second).toHaveAttribute('href', '/campaigns/cmp-2');
    expect(within(second).getByText('cmp-2')).toBeInTheDocument();
    expect(within(second).getByText('Meta Ads')).toBeInTheDocument();
    expect(within(second).getByText('3,00x')).toBeInTheDocument();
    expect(within(items[0]!).getByRole('link')).toBe(first);
  });

  it('informa quando não há campanhas', () => {
    render(<TopCampaignsList campaigns={[]} />);
    expect(screen.getByText('Nenhuma campanha com ROAS no período')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
