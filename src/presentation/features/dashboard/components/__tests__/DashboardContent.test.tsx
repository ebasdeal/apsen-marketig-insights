import { buildDashboard } from '@test/factories';
import { render, screen, within } from '@testing-library/react';
import { DashboardContent } from '../DashboardContent';

describe('DashboardContent', () => {
  it('mostra os KPIs e as seções de canais e top campanhas', () => {
    render(<DashboardContent summary={buildDashboard()} />);
    expect(screen.getByRole('article', { name: 'ROAS: 3,00x' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /^Investimento: / })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /^Receita: / })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /^CPA: / })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /^Impressões: / })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Cliques: 900' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /^CPC: / })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Conversões: 90' })).toBeInTheDocument();
    expect(screen.getByText('1 de 2 campanhas ativas')).toBeInTheDocument();
    expect(screen.getByText('CTR 4,50%')).toBeInTheDocument();
    expect(screen.getByText('Taxa 10,00%')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Investimento por canal' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Top campanhas por ROAS' })).toBeInTheDocument();
  });

  it('aplica ícone e tom de cada KPI', () => {
    render(<DashboardContent summary={buildDashboard()} />);
    const roas = screen.getByRole('article', { name: 'ROAS: 3,00x' });
    expect(within(roas).getByText('🎯')).toHaveClass('bg-apsen-kpi-orange');
    expect(within(roas).getByText('3,00x')).toHaveClass('text-apsen-orange');
    const revenue = screen.getByRole('article', { name: /^Receita: / });
    expect(within(revenue).getByText('📈')).toHaveClass('bg-apsen-kpi-green');
    const spend = screen.getByRole('article', { name: /^Investimento: / });
    expect(within(spend).getByText('💰')).toHaveClass('bg-apsen-kpi-blue');
  });

  it('leva para a lista pelo "Ver todas →" do painel de top campanhas', () => {
    render(<DashboardContent summary={buildDashboard()} />);
    const panel = screen.getByRole('region', { name: 'Top campanhas por ROAS' });
    const more = within(panel).getByRole('link', { name: 'Ver todas as campanhas' });
    expect(more).toHaveAttribute('href', '/campaigns');
    expect(more).toHaveTextContent('Ver todas →');
  });
});
