import { listIngeridosResult } from '@test/fakes/ingeridos';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { IngeridosScreen } from '../IngeridosScreen';

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  navigationState.pathname = '/admin/ingeridos';
  const useCases = createFakeUseCases(overrides);
  return { useCases, ...renderWithProviders(<IngeridosScreen />, useCases) };
}

function linhas() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1);
}

describe('IngeridosScreen — CA-01 CA-03', () => {
  it('mostra header, toolbar, resumo e 4 linhas com as cores do registro', async () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Drivers Ingeridos' })).toBeInTheDocument();
    const categoria = screen.getByRole('combobox', { name: 'Categoria' });
    expect(
      within(categoria)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual([
      'Todas as categorias',
      'Mídia',
      'Comercial',
      'Produto',
      'Supply',
      'Logística',
      'Concorrência',
      'Regulatório',
      'Sazonalidade',
      'Social',
      'Macro',
    ]);
    expect(await screen.findByText('4 drivers')).toBeInTheDocument();
    expect(linhas()).toHaveLength(4);
    expect(screen.getByText('DRF-2026-027')).toHaveClass('text-apsen-teal');
    expect(screen.getByText('dummy_censored')).toHaveClass('text-apsen-red');
    expect(screen.getByText('⚗️ Falta MP')).toHaveClass('bg-apsen-orange-bg');
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
  });

  it('RN-04 Exportar só mostra o toast', async () => {
    const { useCases, user } = setup();
    await screen.findByText('4 drivers');
    await user.click(screen.getByRole('button', { name: 'Exportar para ML Engine' }));
    expect(
      await screen.findByText('Exportando para ML Engine...', { exact: false }),
    ).toBeInTheDocument();
    expect(useCases.ingeridos.remove.execute).not.toHaveBeenCalled();
    expect(useCases.ingeridos.list.execute).toHaveBeenCalledTimes(1);
  });
});

describe('IngeridosScreen — CA-02', () => {
  it('busca grava q após o debounce e categoria grava sem page', async () => {
    navigationState.search = 'page=2';
    const { user } = setup();
    await screen.findByText('4 drivers');
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar drivers ingeridos' }), {
      target: { value: 'bari' },
    });
    expect(routerMock.replace).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith('/admin/ingeridos?q=bari', { scroll: false }),
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Categoria' }), 'Supply');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/ingeridos?categoria=Supply', {
      scroll: false,
    });
  });

  it('paginação aparece com mais de uma página', async () => {
    const list = vi.fn().mockResolvedValue({ ...listIngeridosResult(), totalPages: 2 });
    const { user } = setup({ ingeridos: { list: { execute: list } } });
    await user.click(await screen.findByRole('button', { name: 'Página 2' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/ingeridos?page=2', {
      scroll: false,
    });
  });
});

describe('IngeridosScreen — CA-04 CA-05', () => {
  it('Ver abre o detalhe', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Ver DRV-2026-029' }));
    const dialog = await screen.findByRole('dialog', { name: 'Driver DRV-2026-029' });
    expect(within(dialog).getByText('SKU-00312')).toBeInTheDocument();
    expect(within(dialog).getByText('Supply & PCP')).toBeInTheDocument();
    const fechar = within(dialog).getAllByRole('button', { name: 'Fechar' });
    await user.click(fechar[fechar.length - 1]!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Remover confirma, some na hora e a falha restaura com toast', async () => {
    let rejeitar: (error: unknown) => void = () => undefined;
    const remove = vi.fn(
      () => new Promise<{ toast: string }>((_resolve, reject) => (rejeitar = reject)),
    );
    const { user } = setup({ ingeridos: { remove: { execute: remove } } });
    await user.click(await screen.findByRole('button', { name: 'Remover DRV-2026-029' }));
    const dialog = screen.getByRole('dialog', {
      name: 'Remover o driver DRV-2026-029 da ingestão?',
    });
    await user.click(within(dialog).getByRole('button', { name: 'Remover' }));
    expect(screen.queryByText('DRV-2026-029')).not.toBeInTheDocument();
    expect(screen.getByText('3 drivers')).toBeInTheDocument();
    rejeitar(new Error('500'));
    expect(await screen.findByText('DRV-2026-029')).toBeInTheDocument();
    expect(
      await screen.findByText('Não foi possível salvar as alterações', { exact: false }),
    ).toBeInTheDocument();
  });

  it('cancelar a remoção mantém a linha', async () => {
    const { useCases, user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Remover DRV-2026-029' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(useCases.ingeridos.remove.execute).not.toHaveBeenCalled();
  });
});

describe('IngeridosScreen — CA-06', () => {
  it('carregando, erro com Tentar novamente e vazio', async () => {
    const list = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValue({ rows: [], total: 0, totalPages: 1, resumo: '0 drivers' });
    const { user } = setup({ ingeridos: { list: { execute: list } } });
    expect(screen.getByRole('status', { name: 'Carregando ingeridos…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhum driver ingerido encontrado.')).toBeInTheDocument();
    expect(screen.getByText('0 drivers')).toBeInTheDocument();
  });
});
