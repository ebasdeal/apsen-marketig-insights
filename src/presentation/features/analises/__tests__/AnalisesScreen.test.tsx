import { buildAnalise, buildListAnalisesOutput } from '@test/fixtures/analises';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { AnalisesScreen } from '../AnalisesScreen';

function comLista(saida = buildListAnalisesOutput()) {
  return createFakeUseCases({ analises: { list: { execute: vi.fn().mockResolvedValue(saida) } } });
}

describe('AnalisesScreen', () => {
  it('CA-01: cabeçalho, ação laranja, descrição e filtros', async () => {
    renderWithProviders(<AnalisesScreen />);
    expect(screen.getByRole('heading', { level: 1, name: 'Análises' })).toBeInTheDocument();
    expect(screen.getByText('Análises de impacto de drivers · ApsenPLPEngine')).toBeInTheDocument();
    const nova = screen.getByRole('link', { name: '+ Nova Análise' });
    expect(nova).toHaveAttribute('href', '/analises/nova');
    expect(nova).toHaveClass('bg-apsen-orange');
    expect(screen.getByText(/Salvar é obrigatório para emitir relatório/)).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Título, SKU, ciclo...')).toBeInTheDocument();
    expect(
      await screen.findByText('Impacto campanha TV Inverno — Baricitinibe'),
    ).toBeInTheDocument();
  });

  it('CA-01 / RN-01: busca com debounce e status vão para a URL e voltam à página 1', async () => {
    const useCases = comLista();
    const { user } = renderWithProviders(<AnalisesScreen />, useCases);
    await user.type(screen.getByLabelText('Buscar análises'), 'plp');
    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith('/?busca=plp', { scroll: false }),
    );
    await user.selectOptions(screen.getByLabelText('Status'), 'salva');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/?status=salva', { scroll: false });
  });

  it('lê busca, status e página da URL e chama a API', async () => {
    navigationState.search = 'busca=plp&status=salva&pagina=2';
    const useCases = comLista();
    renderWithProviders(<AnalisesScreen />, useCases);
    await waitFor(() =>
      expect(useCases.analises.list.execute).toHaveBeenCalledWith({
        busca: 'plp',
        status: 'salva',
        pagina: 2,
      }),
    );
    expect(screen.getByLabelText('Buscar análises')).toHaveValue('plp');
  });

  it('CA-02: singular e plural no contador', async () => {
    const { unmount } = renderWithProviders(<AnalisesScreen />, comLista());
    expect(await screen.findByText('análise')).toBeInTheDocument();
    unmount();
    renderWithProviders(
      <AnalisesScreen />,
      comLista(
        buildListAnalisesOutput([buildAnalise(), buildAnalise({ id: 'ANL-002', titulo: 'B' })]),
      ),
    );
    expect(await screen.findByText('análises')).toBeInTheDocument();
  });

  it('CA-03: card com link, pill e meta; vazio mostra 🔬', async () => {
    const { unmount } = renderWithProviders(<AnalisesScreen />, comLista());
    const link = await screen.findByRole('link', {
      name: 'Impacto campanha TV Inverno — Baricitinibe',
    });
    expect(link).toHaveAttribute('href', '/analises/ANL-001');
    expect(within(link).getByText('✅ Salva')).toBeInTheDocument();
    expect(
      screen.getByText(/🗓️ PLP-2026-07.*📦 2 SKU\(s\).*⚙️ SARIMAX.*📅 20\/06\/2026/),
    ).toBeInTheDocument();
    unmount();
    renderWithProviders(<AnalisesScreen />, comLista(buildListAnalisesOutput([])));
    expect(await screen.findByText('Nenhuma análise encontrada')).toBeInTheDocument();
  });

  it('paginação acima de 10 itens', async () => {
    const saida = { ...buildListAnalisesOutput(), total: 25 };
    const { user } = renderWithProviders(<AnalisesScreen />, comLista(saida));
    await user.click(await screen.findByRole('button', { name: 'Página 2' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/?pagina=2', { scroll: false });
  });

  it('CA-14: carregando e erro com Tentar novamente', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValue(buildListAnalisesOutput());
    const { user } = renderWithProviders(
      <AnalisesScreen />,
      createFakeUseCases({ analises: { list: { execute } } }),
    );
    expect(screen.getByText('Carregando análises…')).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByText('Impacto campanha TV Inverno — Baricitinibe'),
    ).toBeInTheDocument();
  });
});
