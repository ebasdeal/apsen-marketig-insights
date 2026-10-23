import { useCampaignFiltersStore } from '@presentation/stores/campaignFiltersStore';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignResultSummary } from '../CampaignResultSummary';

describe('CampaignResultSummary', () => {
  it('mostra o contador com o período e sem limpar quando não há filtro', () => {
    render(<CampaignResultSummary count={15} />);
    const summary = screen.getByText(/campanhas ·/);
    expect(summary).toHaveTextContent('15 campanhas · Todo o período');
    expect(summary).toHaveAttribute('aria-live', 'polite');
    expect(summary).toHaveClass('text-[13px]', 'text-apsen-muted');
    expect(screen.getByText('15').tagName).toBe('STRONG');
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
  });

  it('usa o singular para uma campanha', () => {
    render(<CampaignResultSummary count={1} />);
    expect(screen.getByText(/campanha ·/)).toHaveTextContent('1 campanha · Todo o período');
  });

  it('limpa os filtros ativos, inclusive a busca', async () => {
    useCampaignFiltersStore.setState({ channel: 'meta', period: '30d', search: 'x', page: 2 });
    const user = userEvent.setup();
    render(<CampaignResultSummary count={2} />);
    expect(screen.getByText(/campanhas ·/)).toHaveTextContent('2 campanhas · Últimos 30 dias');

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(useCampaignFiltersStore.getState()).toMatchObject({
      channel: null,
      status: null,
      period: 'all',
      search: '',
      page: 1,
    });
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
  });

  it('considera só a busca como filtro ativo', () => {
    useCampaignFiltersStore.setState({ search: 'alfa' });
    render(<CampaignResultSummary count={0} />);
    expect(screen.getByRole('button', { name: 'Limpar filtros' })).toBeInTheDocument();
  });
});
