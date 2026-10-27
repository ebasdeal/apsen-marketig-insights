import { makeCatalogRow } from '@test/factories/catalogo';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CatalogFilters, familiaGroups } from '../CatalogFilters';
import { CatalogScreen } from '../CatalogScreen';
import { CatalogTable } from '../CatalogTable';
import { FranquiaPill } from '../FranquiaPill';
import { familiaAposFranquia } from '../useCatalogParams';

const FILTROS = {
  franquias: ['ASTER', 'LYRA'],
  familiasPorFranquia: { ASTER: ['FEMELIV', 'LEVOXIN'], LYRA: ['ALOIS'] },
};

function pagina(total: number) {
  return vi.fn(async (query: { page: number; size: number }) => ({
    rows: [makeCatalogRow()],
    total,
    page: query.page,
    size: query.size,
  }));
}

function renderCatalog(listFamilias = pagina(92)) {
  const useCases = createFakeUseCases({
    catalogo: {
      listFamilias: { execute: listFamilias },
      filters: { execute: vi.fn().mockResolvedValue(FILTROS) },
    },
  });
  return { useCases, ...renderWithProviders(<CatalogScreen />, useCases) };
}

describe('CatalogScreen (catálogo CA-01, CA-03, CA-04)', () => {
  beforeEach(() => {
    navigationState.pathname = '/drivers/catalogo';
  });

  it('título, ScreenDesc, contador plural e paginação', async () => {
    navigationState.search = 'page=2&size=25';
    const { useCases } = renderCatalog();
    expect(screen.getByRole('heading', { name: 'Catálogo de Produtos' })).toBeInTheDocument();
    expect(
      screen.getByText('Franquias e famílias cadastradas · Drivers por produto'),
    ).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Carregando catálogo…' })).toBeInTheDocument();
    expect(await screen.findByText('Mostrando 26–50 de 92')).toBeInTheDocument();
    expect(screen.getByText('92', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/famílias no catálogo/)).toBeInTheDocument();
    expect(useCases.catalogo.listFamilias.execute).toHaveBeenCalledWith({
      busca: '',
      franquia: '',
      familia: '',
      page: 2,
      size: 25,
    });
    expect(useCases.drivers.list.execute).not.toHaveBeenCalled();
  });

  it('contador singular e sem paginação', async () => {
    renderCatalog(pagina(1));
    expect(await screen.findByText(/família no catálogo/)).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
  });

  it('erro com Tentar novamente', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('x'));
    const { user } = renderCatalog(execute);
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
  });

  it('franquia limpa a família de outra franquia, tamanho e página gravam na URL', async () => {
    navigationState.search = 'familia=LEVOXIN';
    const { user } = renderCatalog();
    await screen.findByText('Mostrando 1–10 de 92');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por franquia' }),
      'LYRA',
    );
    expect(routerMock.replace).toHaveBeenLastCalledWith('/drivers/catalogo?franquia=LYRA', {
      scroll: false,
    });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Itens por página' }), '50');
    expect(routerMock.replace).toHaveBeenLastCalledWith(
      '/drivers/catalogo?familia=LEVOXIN&size=50',
      {
        scroll: false,
      },
    );
    await user.click(screen.getByRole('button', { name: 'Página 2' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith(
      '/drivers/catalogo?familia=LEVOXIN&page=2',
      {
        scroll: false,
      },
    );
  });

  it('busca grava q e page=1 só após 300 ms', async () => {
    vi.useFakeTimers();
    renderCatalog();
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar família ou SKU' }), {
      target: { value: 'lev' },
    });
    act(() => vi.advanceTimersByTime(200));
    expect(routerMock.replace).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(150));
    expect(routerMock.replace).toHaveBeenCalledWith('/drivers/catalogo?q=lev', { scroll: false });
    vi.useRealTimers();
  });
});

describe('CatalogFilters (RN-04)', () => {
  it('sem franquia agrupa por franquia; com franquia só as dela', () => {
    expect(familiaGroups(FILTROS, '').groups.map((grupo) => grupo.label)).toEqual([
      'ASTER',
      'LYRA',
    ]);
    expect(familiaGroups(FILTROS, 'LYRA').options).toEqual([{ value: 'ALOIS', label: 'ALOIS' }]);
    expect(familiaGroups(FILTROS, 'X').options).toEqual([]);
    expect(familiaGroups(undefined, '')).toEqual({ options: [], groups: [] });
    render(
      <CatalogFilters
        busca=""
        onBusca={vi.fn()}
        franquia=""
        onFranquia={vi.fn()}
        familia=""
        onFamilia={vi.fn()}
        filtros={FILTROS}
      />,
    );
    expect(screen.getByRole('search', { name: 'Filtrar catálogo' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'LYRA' })).toBeInTheDocument();
  });

  it('familiaAposFranquia', () => {
    expect(familiaAposFranquia('LEVOXIN', 'LYRA', FILTROS)).toBe('');
    expect(familiaAposFranquia('LEVOXIN', 'ASTER', FILTROS)).toBe('LEVOXIN');
    expect(familiaAposFranquia('LEVOXIN', '', FILTROS)).toBe('LEVOXIN');
    expect(familiaAposFranquia('X', 'ASTER', undefined)).toBe('');
  });
});

describe('CatalogTable (CA-02, CA-07, RN-07, RN-10)', () => {
  it('colunas, pills e links', () => {
    render(
      <CatalogTable
        rows={[
          makeCatalogRow(),
          makeCatalogRow({ familia: 'FEMELIV', nDrivers: 0 }),
          makeCatalogRow({ familia: 'MOTILEX HA + MSM', franquia: 'LYRA' }),
        ]}
      />,
    );
    expect(
      screen.getByRole('table', { name: 'Famílias do catálogo de produtos' }),
    ).toBeInTheDocument();
    ['Franquia', 'Família', 'SKUs', 'Drivers', 'Ações'].forEach((nome) =>
      expect(screen.getByRole('columnheader', { name: nome })).toHaveAttribute('scope', 'col'),
    );
    expect(screen.getAllByText('ASTER')[0]).toHaveClass('text-apsen-pal-blue');
    expect(screen.getAllByText('2')[0]).toHaveClass('bg-apsen-blue-bg');
    expect(screen.getByText('0')).toHaveClass('text-apsen-muted');
    expect(screen.getByRole('link', { name: 'Ver drivers da família LEVOXIN' })).toHaveAttribute(
      'href',
      '/drivers/catalogo/LEVOXIN',
    );
    expect(
      screen.getByRole('link', { name: 'Ver drivers da família MOTILEX HA + MSM' }),
    ).toHaveAttribute('href', '/drivers/catalogo/MOTILEX%20HA%20%2B%20MSM');
  });

  it('vazio e franquia desconhecida', () => {
    render(<CatalogTable rows={[]} />);
    expect(screen.getByText('Nenhuma família encontrada com os filtros atuais.')).toHaveAttribute(
      'colspan',
      '5',
    );
    render(<FranquiaPill franquia="NOVA" />);
    expect(screen.getByText('NOVA')).toHaveClass('text-apsen-pal-slate');
  });
});
