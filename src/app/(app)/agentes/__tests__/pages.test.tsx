import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import EditarAgentePage, { metadata as editarMeta } from '../[id]/editar/page';
import EditarAgenteLoading from '../[id]/editar/loading';
import AgenteNotFound from '../[id]/editar/not-found';
import AgentesLoading from '../loading';
import NovoAgentePage, { metadata as novoMeta } from '../novo/page';
import AgentesPage, { metadata as agentesMeta } from '../page';

describe('rotas de Agentes', () => {
  it('definem os títulos', () => {
    expect(agentesMeta.title).toBe('Agentes de IA');
    expect(novoMeta.title).toBe('Novo Agente');
    expect(editarMeta.title).toBe('Editar Agente');
  });

  it('lista e novo renderizam', async () => {
    renderWithProviders(
      <>
        <AgentesPage />
        <NovoAgentePage />
      </>,
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Agentes de IA' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar Agente' })).toBeInTheDocument();
  });

  it('edição aguarda params (Promise)', async () => {
    const page = await EditarAgentePage({
      params: Promise.resolve({ id: 'AG-005' }),
    } as Parameters<typeof EditarAgentePage>[0]);
    renderWithProviders(page);
    expect(await screen.findByDisplayValue('Desenvolvimento')).toBeInTheDocument();
  });

  it('loading e not-found', () => {
    renderWithProviders(
      <>
        <AgentesLoading />
        <EditarAgenteLoading />
        <AgenteNotFound />
      </>,
    );
    expect(screen.getAllByRole('status', { name: 'Carregando…' })).toHaveLength(2);
    expect(screen.getByText('Agente não encontrado')).toBeInTheDocument();
  });
});
