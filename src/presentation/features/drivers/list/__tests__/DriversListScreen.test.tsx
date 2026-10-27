import { makeDriverListItem, makeDriversPage } from '@test/factories/drivers';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { DriverListItem, formatVerba } from '../DriverListItem';
import { DriversListScreen } from '../DriversListScreen';

function renderList(execute: () => Promise<unknown>) {
  const useCases = createFakeUseCases({ drivers: { list: { execute: vi.fn(execute) as never } } });
  return { useCases, ...renderWithProviders(<DriversListScreen />, useCases) };
}

describe('DriversListScreen (meus-registros CA-01..04)', () => {
  beforeEach(() => {
    navigationState.pathname = '/drivers';
  });

  it('mostra header, ScreenDesc e vazio do protótipo', async () => {
    renderList(async () => makeDriversPage({ items: [], total: 0 }));
    expect(screen.getByRole('heading', { name: 'Meus Registros' })).toBeInTheDocument();
    expect(screen.getByText('Drivers cadastrados nesta sessão')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+ Novo Driver' })).toHaveAttribute(
      'href',
      '/drivers/novo',
    );
    expect(await screen.findByText('Nenhum registro ainda')).toBeInTheDocument();
    expect(screen.getByText('Registrar Driver', { selector: 'strong' })).toBeInTheDocument();
  });

  it('skeleton e erro com Tentar novamente', async () => {
    const { useCases, user } = renderList(async () => {
      throw new Error('falhou');
    });
    expect(screen.getByRole('status', { name: 'Carregando registros…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(useCases.drivers.list.execute).toHaveBeenCalledTimes(2));
  });

  it('total 60 na página 2: pede a página, mostra seletor e muda a URL', async () => {
    navigationState.search = 'page=2&size=10';
    const { useCases, user } = renderList(async () => makeDriversPage({ total: 60, page: 2 }));
    expect(await screen.findByRole('list', { name: 'Drivers registrados' })).toBeInTheDocument();
    expect(useCases.drivers.list.execute).toHaveBeenCalledWith({ page: 2, size: 10 });
    expect(screen.getByRole('combobox', { name: 'Itens por página' })).toBeInTheDocument();
    expect(screen.getByText('Mostrando 11–20 de 60')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(routerMock.replace).toHaveBeenCalledWith('/drivers?page=3', { scroll: false });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Itens por página' }), '25');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/drivers?size=25', { scroll: false });
  });

  it('total 4: sem paginação nem seletor; página além da última volta', async () => {
    navigationState.search = 'page=9';
    renderList(async () => makeDriversPage({ items: [], total: 4 }));
    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith('/drivers', { scroll: false }),
    );
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
  });

  it('remover pede confirmação, some na hora e chama DELETE; cancelar mantém', async () => {
    let finalizar: () => void = () => undefined;
    const remove = vi.fn(() => new Promise<void>((resolve) => (finalizar = resolve)));
    const useCases = createFakeUseCases({ drivers: { remove: { execute: remove } } });
    const { user } = renderWithProviders(<DriversListScreen />, useCases);
    const botao = await screen.findByRole('button', { name: /^Remover Baricitinibe/ });
    await user.click(botao);
    let dialog = screen.getByRole('dialog', { name: 'Remover registro' });
    expect(within(dialog).getByText('Remover este registro?')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(remove).not.toHaveBeenCalled();
    await user.click(botao);
    dialog = screen.getByRole('dialog', { name: 'Remover registro' });
    await user.click(within(dialog).getByRole('button', { name: 'Remover' }));
    await waitFor(() => expect(screen.queryByText(/Campanha Instagram/)).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledWith('1');
    finalizar();
  });
});

describe('DriverListItem (CA-02, RN-03)', () => {
  it('título e linhas do driver 1', () => {
    renderWithProviders(
      <ul>
        <DriverListItem item={makeDriverListItem()} onRemove={vi.fn()} />
      </ul>,
    );
    expect(
      screen.getByText('Baricitinibe 2mg (SKU-00312) — Campanha Instagram Jul/2026'),
    ).toBeInTheDocument();
    const info = screen.getByText(/📅 2026-07-01 → 2026-07-31/);
    expect(info).toHaveTextContent('⚡ ★★★★☆');
    expect(info).toHaveTextContent('💰 R$ 250.000');
    expect(info).toHaveTextContent('🏪 farmacias');
    expect(info).toHaveTextContent('💬 Teste de registro');
    expect(screen.getByText('impressoes', { selector: 'em' })).toBeInTheDocument();
    expect(screen.getByText('💻 Digital')).toHaveClass('bg-apsen-cat-tv-bg');
  });

  it('sem verba, canais, parâmetros e observações omite as linhas', () => {
    renderWithProviders(
      <ul>
        <DriverListItem
          item={makeDriverListItem({ verba: null, canais: [], parametros: [], observacoes: '' })}
          onRemove={vi.fn()}
        />
      </ul>,
    );
    expect(screen.queryByText(/💰/)).not.toBeInTheDocument();
    expect(screen.queryByText(/🏪/)).not.toBeInTheDocument();
    expect(screen.queryByText(/💬/)).not.toBeInTheDocument();
    expect(formatVerba(1800000)).toBe('1.800.000');
  });
});
