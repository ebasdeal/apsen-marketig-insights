import { formatCurrency } from '@presentation/format/formatters';
import { buildDetails } from '@test/factories';
import { render, screen, within } from '@testing-library/react';
import { BackToCampaignsLink } from '../BackToCampaignsLink';
import { BudgetUsage } from '../BudgetUsage';
import { CampaignCrumb } from '../CampaignCrumb';
import { CampaignHeader } from '../CampaignHeader';
import { CampaignKpiGrid } from '../CampaignKpiGrid';
import { MetricsGrid } from '../MetricsGrid';

describe('BackToCampaignsLink', () => {
  it('aponta para a lista de campanhas com visual de botão ghost', () => {
    render(<BackToCampaignsLink />);
    const link = screen.getByRole('link', { name: 'Voltar' });
    expect(link).toHaveAttribute('href', '/campaigns');
    expect(link).toHaveTextContent('← Voltar');
    expect(link.className).toContain('mb-[16px]');
    expect(link.className).toContain('w-fit');
  });
});

describe('CampaignCrumb', () => {
  it('mostra o link Campanhas e o nome da campanha atual', () => {
    render(<CampaignCrumb name="Black Friday" />);
    const nav = screen.getByRole('navigation', { name: 'Trilha da campanha' });
    expect(within(nav).getByRole('link', { name: 'Campanhas' })).toHaveAttribute(
      'href',
      '/campaigns',
    );
    expect(within(nav).getByText('Black Friday')).toHaveAttribute('aria-current', 'page');
  });
});

describe('CampaignHeader', () => {
  it('mostra nome, status grande, canal, período, duração e código', () => {
    render(<CampaignHeader campaign={buildDetails({ channel: 'meta', status: 'pausada' })} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Campanha Teste' })).toBeInTheDocument();
    expect(screen.getByText('Meta Ads').tagName).toBe('STRONG');
    expect(screen.getByText('01/01/2026 – 31/01/2026').tagName).toBe('STRONG');
    expect(screen.getByText(/^Canal:/)).toHaveTextContent(
      'Canal: Meta Ads · Período: 01/01/2026 – 31/01/2026 · 31 dias · cmp-1',
    );
    expect(screen.getByText('Pausada').closest('[data-status]')).toHaveAttribute(
      'data-status',
      'pausada',
    );
    expect(screen.getByText('Pausada')).toHaveClass('border-apsen-orange-b');
    expect(screen.getByText('Pausada').parentElement).toHaveClass(
      'flex',
      'items-center',
      'gap-[8px]',
    );
  });
});

describe('BudgetUsage', () => {
  it('mostra gasto, orçamento e uso dentro do limite', () => {
    render(<BudgetUsage spend={500} budget={1000} usage={50} overBudget={false} />);
    expect(screen.getByRole('region', { name: '💰 Orçamento' })).toBeInTheDocument();
    expect(screen.getByText('R$ 500,00 de R$ 1.000,00')).toBeInTheDocument();
    expect(screen.getByText('50,00%')).toHaveClass('font-bold');
    expect(screen.getByRole('progressbar', { name: 'Uso do orçamento' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    expect(screen.getByText('Dentro do orçamento')).toHaveClass('text-apsen-muted');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('alerta em vermelho quando o orçamento é excedido', () => {
    render(<BudgetUsage spend={1500} budget={1000} usage={150} overBudget />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Orçamento excedido');
    expect(alert).toHaveClass('text-apsen-red');
    expect(screen.queryByText('Dentro do orçamento')).not.toBeInTheDocument();
  });

  it('lida com uso indefinido', () => {
    render(<BudgetUsage spend={0} budget={0} usage={null} overBudget={false} />);
    expect(screen.getByRole('progressbar', { name: 'Uso do orçamento' })).not.toHaveAttribute(
      'aria-valuenow',
    );
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText('Dentro do orçamento')).not.toBeInTheDocument();
  });
});

describe('CampaignKpiGrid', () => {
  it('renderiza ROAS, Receita, CPA e CTR', () => {
    const { container } = render(<CampaignKpiGrid campaign={buildDetails()} />);
    expect(container.querySelectorAll('article')).toHaveLength(4);
    expect(container.firstChild).toHaveClass('kpi-grid');
    expect(screen.getByLabelText('ROAS: 4,00x')).toBeInTheDocument();
    expect(screen.getByLabelText('Receita: R$ 4.000,00')).toBeInTheDocument();
    expect(screen.getByLabelText('CPA: R$ 20,00')).toBeInTheDocument();
    expect(screen.getByLabelText('CTR: 5,00%')).toBeInTheDocument();
  });
});

describe('MetricsGrid', () => {
  it('renderiza as cinco métricas como lista de definição', () => {
    render(<MetricsGrid campaign={buildDetails()} />);
    const region = screen.getByRole('region', { name: '📊 Métricas da campanha' });
    expect(within(region).getByRole('heading', { level: 2 })).toHaveClass(
      'text-apsen-orange',
      'border-apsen-orange-soft',
    );
    const terms = within(region).getAllByRole('term');
    expect(terms.map((term) => term.textContent)).toEqual([
      'Impressões',
      'Cliques',
      'Conversões',
      'Taxa de conversão',
      'CPC',
    ]);
    const values = within(region).getAllByRole('definition');
    expect(values.map((value) => value.textContent)).toEqual([
      '10.000',
      '500',
      '50',
      '10,00%',
      formatCurrency(2),
    ]);
  });
});
