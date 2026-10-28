import { buildDashboardOutput } from '@test/fixtures/dashboard';
import { loginAs } from '@test/resetStores';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { DashboardScreen, formatarAtualizadoEm } from '../DashboardScreen';

describe('DashboardScreen', () => {
  it('CA-01: título, ciclo ativo e horário da carga', async () => {
    renderWithProviders(<DashboardScreen />);
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard — Demand Intelligence' }));
    expect(await screen.findByText('Visão geral do ciclo ativo · PLP-2026-07')).toBeInTheDocument();
    expect(
      screen.getByText(new Date('2026-10-27T13:05:00.000Z').toLocaleString('pt-BR')),
    ).toBeInTheDocument();
    expect(formatarAtualizadoEm(undefined)).toBe('—');
  });

  it('CA-03: 4 cartões com hints e links', async () => {
    renderWithProviders(<DashboardScreen />);
    const pipeline = await screen.findByRole('article', { name: 'Drivers no pipeline: 14' });
    expect(within(pipeline).getByText('2 pendentes')).toHaveClass('text-apsen-yellow-fg');
    expect(screen.getByRole('article', { name: 'Restrições ativas: 8' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Itens no plano PLP-2026-07: 247' }));
    const analises = screen.getByRole('article', { name: 'Análises realizadas: 2' });
    expect(within(analises).getByText('2 salvas')).toHaveClass('text-apsen-green-fg');
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining(['/admin/aprovacoes', '/restricoes', '/planos', '/analises']),
    );
  });

  it('CA-04/05/06/07: barras, pendentes e plano', async () => {
    renderWithProviders(<DashboardScreen />);
    expect(await screen.findByRole('meter', { name: 'Concorrência' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByRole('meter', { name: 'Matéria-Prima' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Revisar' })).toHaveLength(4);
    expect(screen.getByText('Baricitinibe 2mg')).toBeInTheDocument();
    expect(screen.getByText('+mais 2')).toBeInTheDocument();
    expect(screen.getByText('43%')).toBeInTheDocument();
    expect(screen.getByText('247 itens · PLP-2026-07')).toBeInTheDocument();
  });

  it('vazios por painel e plano sem itens', async () => {
    const vazio = buildDashboardOutput({
      cicloAtivo: null,
      restricoes: { ativas: 0, criticas: 0, porTipo: [] },
      aguardandoAprovacao: { total: 0, itens: [] },
      plano: {
        total: 0,
        aprovados: 0,
        porStatus: { aprovado: 0, revisao: 0, bloqueado: 0, pendente: 0 },
      },
    });
    renderWithProviders(
      <DashboardScreen />,
      createFakeUseCases({
        dashboard: { overview: { execute: vi.fn().mockResolvedValue(vazio) } },
      }),
    );
    expect(await screen.findByText('✅ Nenhuma restrição ativa')).toBeInTheDocument();
    expect(screen.getByText('✅ Nenhum driver pendente')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('0 itens · sem ciclo ativo')).toBeInTheDocument();
  });

  it.each([
    ['viewer', false],
    ['planejador', true],
  ] as const)('sem ciclo ativo (%s): estado claro com link para ciclos', async (perfil, dica) => {
    loginAs(perfil);
    const semCiclo = buildDashboardOutput({ cicloAtivo: null });
    renderWithProviders(
      <DashboardScreen />,
      createFakeUseCases({
        dashboard: { overview: { execute: vi.fn().mockResolvedValue(semCiclo) } },
      }),
    );
    expect(await screen.findByText('Nenhum ciclo ativo.')).toBeInTheDocument();
    expect(screen.getByText('Visão geral do ciclo ativo · Nenhum ciclo ativo')).toBeInTheDocument();
    expect(
      screen.getByRole('article', { name: 'Itens no plano (sem ciclo ativo): 247' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver ciclos de planejamento' })).toHaveAttribute(
      'href',
      '/admin/ciclos',
    );
    expect(screen.queryByText(/Ative um ciclo/) !== null).toBe(dica);
    expect(screen.queryByText(/·s*—/)).not.toBeInTheDocument();
  });

  it('CA-08: carregando, erro com Tentar novamente e recarga', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValue(buildDashboardOutput());
    const { user } = renderWithProviders(
      <DashboardScreen />,
      createFakeUseCases({ dashboard: { overview: { execute } } }),
    );
    expect(screen.getByRole('status', { name: 'Carregando dashboard…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Drivers por Categoria')).toBeInTheDocument();
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('CA-02: banner por perfil; admin oculto', async () => {
    renderWithProviders(<DashboardScreen />);
    await screen.findByText('Drivers por Categoria');
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it.each([
    ['planejador', 'Planejador', 'bg-apsen-kpi-blue'],
    ['area', 'Área', 'bg-apsen-teal-soft'],
    ['viewer', 'Visualizador', 'bg-apsen-bg'],
  ] as const)('banner do perfil %s', async (perfil, rotulo, classe) => {
    loginAs(perfil);
    renderWithProviders(<DashboardScreen />);
    const banner = await screen.findByRole('note');
    expect(banner).toHaveTextContent(`🔑 Você está como ${rotulo} —`);
    expect(banner).toHaveClass(classe);
  });
});
