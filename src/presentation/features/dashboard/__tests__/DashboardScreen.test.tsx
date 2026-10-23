import type { UseCases } from '@presentation/providers/UseCasesContext';
import { useCampaignFiltersStore } from '@presentation/stores/campaignFiltersStore';
import { buildDashboard } from '@test/factories';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { DashboardScreen } from '../DashboardScreen';

type Execute = UseCases['getDashboardSummary']['execute'];

function setup(execute: Execute) {
  const useCases = createFakeUseCases({ getDashboardSummary: { execute } });
  return renderWithProviders(<DashboardScreen />, useCases);
}

describe('DashboardScreen', () => {
  it('mostra loading enquanto carrega', () => {
    setup(vi.fn(() => new Promise<never>(() => undefined)));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando indicadores…');
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  });

  it('mostra KPIs, canais e top campanhas', async () => {
    setup(vi.fn().mockResolvedValue(buildDashboard()));
    expect(
      await screen.findByRole('region', { name: 'Investimento por canal' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'ROAS: 3,00x' })).toBeInTheDocument();
    expect(screen.getByText('1 de 2 campanhas ativas')).toBeInTheDocument();
    expect(screen.getByText('CTR 4,50%')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Google Ads' })).toBeInTheDocument();
    expect(screen.getByText('Top Um')).toBeInTheDocument();
  });

  it('oferece links para o detalhe e para a lista de campanhas', async () => {
    setup(vi.fn().mockResolvedValue(buildDashboard()));
    expect(screen.queryByRole('link', { name: 'Ver todas as campanhas' })).not.toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Abrir campanha Top Dois' })).toHaveAttribute(
      'href',
      '/campaigns/cmp-2',
    );
    expect(screen.getByRole('link', { name: 'Ver todas as campanhas' })).toHaveAttribute(
      'href',
      '/campaigns',
    );
  });

  it('mostra estado vazio', async () => {
    setup(vi.fn().mockResolvedValue(buildDashboard({ campaignCount: 0 })));
    expect(await screen.findByText('Sem campanhas no período')).toBeInTheDocument();
    expect(screen.getByText('Escolha outro período para ver os indicadores.')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ver todas as campanhas' })).not.toBeInTheDocument();
  });

  it('mantém o período e o Atualizar no cabeçalho durante o carregamento', () => {
    setup(vi.fn(() => new Promise<never>(() => undefined)));
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('radiogroup', { name: 'Período' })).toBeInTheDocument();
    expect(within(header).getByRole('button', { name: 'Atualizar' })).toBeDisabled();
    expect(screen.getByText('Visão geral do desempenho das campanhas.')).toBeInTheDocument();
  });

  it('mostra erro e permite tentar novamente', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValue(buildDashboard());
    const { user } = setup(execute);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os dados.',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Top Um')).toBeInTheDocument();
  });

  it('troca o período e refaz a consulta', async () => {
    const execute = vi.fn().mockResolvedValue(buildDashboard());
    const { user } = setup(execute);
    await screen.findByText('Top Um');
    await user.click(screen.getByRole('radio', { name: 'Período: Últimos 90 dias' }));
    expect(useCampaignFiltersStore.getState().period).toBe('90d');
    expect(screen.getByRole('radio', { name: 'Período: Últimos 90 dias' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await waitFor(() =>
      expect(execute).toHaveBeenLastCalledWith({
        period: { start: expect.any(String), end: expect.any(String) },
      }),
    );
  });

  it('atualiza os dados pelo botão Atualizar', async () => {
    let resolveRefetch: (value: ReturnType<typeof buildDashboard>) => void = () => undefined;
    const execute = vi
      .fn()
      .mockResolvedValueOnce(buildDashboard())
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveRefetch = resolve;
          }),
      );
    const { user } = setup(execute);
    await screen.findByText('Top Um');
    await user.click(screen.getByRole('button', { name: 'Atualizar' }));
    const busyButton = await screen.findByRole('button', { name: 'Atualizando…' });
    expect(busyButton).toBeDisabled();
    expect(execute).toHaveBeenCalledTimes(2);
    resolveRefetch(buildDashboard());
    expect(await screen.findByRole('button', { name: 'Atualizar' })).toBeEnabled();
  });
});
