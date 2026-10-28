import { createFakeAgentesUseCases } from '@test/fakes/agentes';
import { AGENTES_PAGE_FIXTURE } from '@test/fixtures/agentes';
import { SESSOES } from '@test/fixtures/sessao';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { useSessaoStore } from '@presentation/stores/sessaoStore';
import { screen, waitFor, within } from '@testing-library/react';
import { AgentesScreen } from '../AgentesScreen';

function setup(overrides: Parameters<typeof createFakeAgentesUseCases>[0] = {}) {
  const agentes = createFakeAgentesUseCases(overrides);
  const result = renderWithProviders(<AgentesScreen />, createFakeUseCases({ agentes }));
  return { ...result, agentes };
}

const REGULATORIO = '🏛️ Agente Regulatório';

describe('AgentesScreen', { timeout: 20000 }, () => {
  beforeEach(() => {
    navigationState.pathname = '/agentes';
  });

  it('CA-01 CA-02 alerta, resumo e colunas com a massa', async () => {
    setup();
    expect(screen.getByRole('link', { name: '+ Novo Agente' })).toHaveAttribute(
      'href',
      '/agentes/novo',
    );
    const alerta = await screen.findByRole('status', { name: '' });
    expect(alerta).toHaveTextContent(
      '5 agentes cadastrados · 3 ativos — próxima execução: Agente Regulatório em 03h00',
    );
    expect(await screen.findByText('anthropic')).toHaveClass('bg-apsen-yellow-soft');
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('✗ Falha — timeout')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remover|Excluir/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: `Editar ${REGULATORIO}` })).toHaveAttribute(
      'href',
      '/agentes/AG-001/editar',
    );
  });

  it('CA-03 toggle grava e mostra o toast', async () => {
    const { user, agentes } = setup();
    await user.click(await screen.findByRole('switch', { name: `Agente ${REGULATORIO} ativo` }));
    await waitFor(() =>
      expect(agentes.toggle.execute).toHaveBeenCalledWith({
        id: 'AG-001',
        papel: REGULATORIO,
        ativo: false,
      }),
    );
    expect(await screen.findByText('⏸ 🏛️ Agente desativado.')).toBeInTheDocument();
  });

  it('CA-03 falha no toggle restaura e mostra o toast de falha', async () => {
    const { user } = setup({ toggle: { execute: vi.fn().mockRejectedValue(new Error('x')) } });
    const toggle = await screen.findByRole('switch', { name: `Agente ${REGULATORIO} ativo` });
    await user.click(toggle);
    expect(
      await screen.findByText('Não foi possível salvar as alterações. Tente novamente.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(toggle).toBeChecked());
  });

  it('CA-04 testar mostra os toasts e desabilita o botão durante o teste', async () => {
    const { user, agentes } = setup();
    const botao = await screen.findByRole('button', { name: `Testar conexão — ${REGULATORIO}` });
    await user.click(botao);
    expect(await screen.findByText('⟳ Testando 🏛️ Agente...')).toBeInTheDocument();
    expect(botao).toBeDisabled();
    expect(
      await screen.findByText('Conexão OK — 🏛️ Agente', undefined, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(agentes.testar.execute).toHaveBeenCalledWith({ id: 'AG-001', papel: REGULATORIO });
  });

  it('CA-05 visualizar abre o modal com a grade e "Fechar" fecha', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: `Visualizar ${REGULATORIO}` }));
    const dialog = await screen.findByRole('dialog', { name: REGULATORIO });
    expect(within(dialog).getByText('https://apsen-di.services.ai.azure.com')).toHaveClass(
      'text-apsen-blue',
    );
    expect(within(dialog).getByText('✅ Ativo')).toBeInTheDocument();
    expect(within(dialog).getByText('19/06/2026 03:12')).toBeInTheDocument();
    await user.click(within(dialog).getAllByRole('button', { name: 'Fechar' })[1]!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pagina com mais de uma página', async () => {
    navigationState.search = 'page=2';
    const list = {
      execute: vi.fn().mockResolvedValue({ ...AGENTES_PAGE_FIXTURE, total: 15, totalPages: 2 }),
    };
    const { user } = setup({ list });
    await screen.findByText('anthropic');
    expect(list.execute).toHaveBeenCalledWith({ page: 2 });
    await user.click(screen.getByRole('button', { name: /1/ }));
    expect(routerMock.replace).toHaveBeenCalled();
  });

  it('inativo só visualiza', async () => {
    useSessaoStore.setState({
      sessao: { ...SESSOES.admin, usuario: { ...SESSOES.admin.usuario, ativo: false } },
      hidratado: true,
    });
    setup();
    expect(
      await screen.findByRole('switch', { name: `Agente ${REGULATORIO} ativo` }),
    ).toBeDisabled();
    expect(screen.queryByRole('link', { name: '+ Novo Agente' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Testar conexão — ${REGULATORIO}` })).toBeDisabled();
  });

  it('CA-11 carregando, erro e vazio com alerta sem agendamento', async () => {
    const list = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(new Error('rede'))
        .mockResolvedValueOnce({ rows: [], total: 0, totalPages: 1 }),
    };
    const resumo = {
      execute: vi.fn().mockResolvedValue({
        total: 0,
        ativos: 0,
        agendados: [],
        proxima: null,
        resumoTexto: '0 agentes cadastrados · 0 ativos',
        alertaTexto: '',
      }),
    };
    const { user } = setup({ list, resumo });
    expect(screen.getByRole('status', { name: 'Carregando agentes…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhum agente cadastrado.')).toBeInTheDocument();
    expect(screen.getByText(/nenhuma execução agendada/)).toBeInTheDocument();
  });

  it('erro no resumo esconde o alerta', async () => {
    setup({ resumo: { execute: vi.fn().mockRejectedValue(new Error('x')) } });
    await screen.findByText('anthropic');
    await waitFor(() => expect(screen.queryByText(/agentes cadastrados/)).not.toBeInTheDocument());
  });
});
