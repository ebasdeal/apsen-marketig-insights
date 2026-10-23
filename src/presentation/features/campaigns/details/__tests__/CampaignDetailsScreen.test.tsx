import type { CampaignDetailsOutput } from '@application/campaigns/dto';
import { CampaignNotFoundError } from '@domain/shared/DomainError';
import { buildDetails } from '@test/factories';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import type { Mock } from 'vitest';
import { CampaignDetailsScreen } from '../CampaignDetailsScreen';

type Execute = Mock<(id: string) => Promise<CampaignDetailsOutput>>;

function setup(execute: Execute, id = 'cmp-1') {
  return renderWithProviders(
    <CampaignDetailsScreen id={id} />,
    createFakeUseCases({ getCampaignDetails: { execute } }),
  );
}

function pending(): Execute {
  return vi.fn(() => new Promise<CampaignDetailsOutput>(() => undefined));
}

function definitionOf(term: string): string | null {
  const match = screen.getAllByRole('term').find((item) => item.textContent === term);
  return match?.nextElementSibling?.textContent ?? null;
}

describe('CampaignDetailsScreen', () => {
  it('mostra loading e o link de voltar enquanto carrega, sem trilha', () => {
    setup(pending());
    expect(screen.getByRole('status')).toHaveTextContent('Carregando campanha…');
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/campaigns');
    expect(
      screen.queryByRole('navigation', { name: 'Trilha da campanha' }),
    ).not.toBeInTheDocument();
  });

  it('mostra trilha, cabeçalho, orçamento, KPIs e métricas na ordem do protótipo', async () => {
    const execute: Execute = vi.fn().mockResolvedValue(buildDetails());
    setup(execute);
    const heading = await screen.findByRole('heading', { level: 1, name: 'Campanha Teste' });
    expect(heading).toBeVisible();
    expect(execute).toHaveBeenCalledWith('cmp-1');
    const crumb = screen.getByRole('navigation', { name: 'Trilha da campanha' });
    expect(within(crumb).getByText('Campanha Teste')).toBeInTheDocument();
    expect(screen.getByText(/^Canal:/)).toHaveTextContent(
      'Canal: Google Ads · Período: 01/01/2026 – 31/01/2026 · 31 dias · cmp-1',
    );
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    const budget = screen.getByRole('region', { name: '💰 Orçamento' });
    expect(within(budget).getByText('50,00%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Uso do orçamento' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    expect(screen.getByLabelText('CTR: 5,00%')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '📊 Métricas da campanha' })).toBeInTheDocument();
    expect(definitionOf('Taxa de conversão')).toBe('10,00%');
    expect(definitionOf('Impressões')).toBe('10.000');
    expect(definitionOf('Cliques')).toBe('500');
    expect(definitionOf('Conversões')).toBe('50');
    expect(screen.queryByText('Orçamento excedido')).not.toBeInTheDocument();
    const back = screen.getByRole('link', { name: 'Voltar' });
    expect(crumb.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(back.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('sinaliza orçamento excedido e KPIs indefinidos', async () => {
    setup(
      vi.fn().mockResolvedValue(
        buildDetails({
          overBudget: true,
          budgetUsage: 150,
          kpis: { ctr: null, cpc: null, cpa: null, roas: null, conversionRate: null },
        }),
      ),
    );
    expect(await screen.findByText('Orçamento excedido')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Uso do orçamento' })).toHaveAttribute(
      'data-exceeded',
      'true',
    );
    expect(screen.getByLabelText('ROAS: —')).toBeInTheDocument();
    expect(definitionOf('CPC')).toBe('—');
  });

  it('mostra campanha não encontrada sem tentar novamente', async () => {
    const execute: Execute = vi.fn().mockRejectedValue(new CampaignNotFoundError('x'));
    setup(execute, 'x');
    const alert = await screen.findByRole('alert');
    expect(
      within(alert).getByRole('heading', { level: 3, name: 'Campanha não encontrada' }),
    ).toBeInTheDocument();
    expect(within(alert).getByText('🔍')).toBeInTheDocument();
    expect(within(alert).getByRole('link', { name: 'Voltar para Campanhas' })).toHaveAttribute(
      'href',
      '/campaigns',
    );
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar' })).toBeInTheDocument();
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('permite tentar novamente após erro', async () => {
    const execute: Execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValue(buildDetails({ name: 'Recuperada' }));
    const { user } = setup(execute);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Não foi possível carregar os dados');
    expect(alert).toHaveTextContent('Verifique sua conexão e tente novamente.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Recuperada' }),
    ).toBeInTheDocument();
  });
});
