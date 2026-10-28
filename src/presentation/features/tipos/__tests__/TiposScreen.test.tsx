import { listTiposResult } from '@test/fakes/tipos';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { TiposScreen } from '../TiposScreen';

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  navigationState.pathname = '/admin/tipos';
  const useCases = createFakeUseCases(overrides);
  return { useCases, ...renderWithProviders(<TiposScreen />, useCases) };
}

function linhas() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1);
}

describe('TiposScreen — CA-01 CA-03', () => {
  it('mostra header, chips, resumo e 10 linhas com as colunas do protótipo', async () => {
    setup();
    expect(
      screen.getByRole('heading', { name: 'Catálogo de Tipos de Driver' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+ Novo Tipo' })).toHaveAttribute(
      'href',
      '/admin/tipos/novo',
    );
    expect(screen.getByRole('radio', { name: 'Filtrar por categoria: Todos' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(await screen.findByText('47 de 47 tipos')).toBeInTheDocument();
    expect(screen.getByText('45 ativos')).toHaveClass('text-apsen-green');
    expect(linhas()).toHaveLength(10);
    const tv = linhas()[0]!;
    expect(within(tv).getByText('continua_grp')).toHaveClass('font-mono', 'text-apsen-teal');
    expect(within(tv).getByText('+1')).toBeInTheDocument();
    expect(within(tv).getByRole('switch', { name: 'Tipo tv ativo' })).toBeChecked();
    expect(within(tv).getByRole('link', { name: 'Editar tipo tv' })).toHaveAttribute(
      'href',
      '/admin/tipos/tv/editar',
    );
    for (const nome of ['Tipo / Slug', 'Feature Engineering', 'Lag', 'Campos']) {
      expect(screen.getByRole('button', { name: `Sobre ${nome}` })).toBeInTheDocument();
    }
    expect(screen.getByText('1–10 de 47 tipos')).toBeInTheDocument();
  });
});

describe('TiposScreen — CA-02 URL', () => {
  it('?cat=midia filtra no servidor; trocar o chip grava cat e volta à página 1', async () => {
    navigationState.search = 'cat=midia&page=2&size=25';
    const { useCases, user } = setup();
    await screen.findByText('47 de 47 tipos');
    expect(useCases.tipos.list.execute).toHaveBeenCalledWith({ page: 2, size: 25, cat: 'midia' });
    await user.click(screen.getByRole('radio', { name: 'Filtrar por categoria: 🛒 Comercial' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/tipos?cat=comercial&size=25', {
      scroll: false,
    });
  });

  it('seletor de tamanho e página gravam na URL', async () => {
    const { user } = setup();
    await screen.findByText('47 de 47 tipos');
    await user.selectOptions(screen.getByRole('combobox'), '50');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/tipos?size=50', { scroll: false });
    await user.click(screen.getByRole('button', { name: 'Página 2' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/tipos?page=2', { scroll: false });
  });
});

describe('TiposScreen — CA-04 CA-05', () => {
  it('toggle é otimista e mostra o toast; falha restaura', async () => {
    const toggle = vi
      .fn()
      .mockResolvedValueOnce({ toast: '⏸ "tv" desativado.' })
      .mockRejectedValueOnce(new Error('500'));
    const { user } = setup({ tipos: { toggle: { execute: toggle } } });
    const chave = await screen.findByRole('switch', { name: 'Tipo tv ativo' });
    await user.click(chave);
    expect(toggle).toHaveBeenCalledWith({ id: 'tv', slug: 'tv', ativo: false });
    expect(await screen.findByText('"tv" desativado.', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'Tipo tv_paga ativo' }));
    expect(
      await screen.findByText('Não foi possível salvar as alterações', { exact: false }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Tipo tv_paga ativo' })).toBeChecked(),
    );
  });

  it('🗑 pede confirmação, remove a linha na hora e mostra o toast', async () => {
    const completo = listTiposResult();
    const semTv = { ...completo, rows: completo.rows.slice(1), filtrados: 46, total: 46 };
    const list = vi.fn().mockResolvedValueOnce(completo).mockResolvedValue(semTv);
    const { useCases, user } = setup({ tipos: { list: { execute: list } } });
    await user.click(await screen.findByRole('button', { name: 'Excluir tipo tv' }));
    const dialog = screen.getByRole('dialog', { name: 'Remover o tipo "tv"?' });
    await user.click(within(dialog).getByRole('button', { name: 'Remover' }));
    expect(useCases.tipos.remove.execute).toHaveBeenCalledWith({ id: 'tv', slug: 'tv' });
    expect(screen.queryByRole('switch', { name: 'Tipo tv ativo' })).not.toBeInTheDocument();
    expect(await screen.findByText('Tipo removido.', { exact: false })).toBeInTheDocument();
  });

  it('cancelar a exclusão não remove', async () => {
    const { useCases, user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Excluir tipo tv' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(useCases.tipos.remove.execute).not.toHaveBeenCalled();
  });
});

describe('TiposScreen — CA-06 CA-12', () => {
  it('Importar JSON abre o modal', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Importar JSON' }));
    expect(
      await screen.findByRole('dialog', { name: 'Importar Catálogo de Tipos' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('carregando, erro com Tentar novamente e vazio', async () => {
    const list = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValueOnce({ ...listTiposResult(), rows: [], filtrados: 0, totalPages: 1 });
    const { user } = setup({ tipos: { list: { execute: list } } });
    expect(screen.getByRole('status', { name: 'Carregando tipos…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhum tipo nesta categoria.')).toBeInTheDocument();
    expect(screen.getByText('0 tipos')).toBeInTheDocument();
  });
});
