import { listAprovacoesResult } from '@test/fakes/aprovacoes';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { AprovacoesScreen } from '../AprovacoesScreen';

function setup(overrides: Parameters<typeof createFakeUseCases>[0] = {}) {
  navigationState.pathname = '/admin/aprovacoes';
  const useCases = createFakeUseCases(overrides);
  return { useCases, ...renderWithProviders(<AprovacoesScreen />, useCases) };
}

function card(id: string) {
  return screen.getByRole('listitem', { name: id });
}

function header() {
  return within(screen.getByRole('heading', { name: 'Fila de Aprovação' }).closest('header')!);
}

describe('AprovacoesScreen — CA-01 CA-03 CA-04', () => {
  it('mostra header com pendentes, resumo e os cards da página 1', async () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Fila de Aprovação' })).toBeInTheDocument();
    expect(await header().findByText('2 pendentes')).toBeInTheDocument();
    const lista = await screen.findByRole('list', { name: 'Fila de aprovação' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText(/registros encontrados/)).toBeInTheDocument();
    const drv33 = card('DRV-2026-033');
    expect(within(drv33).getByText('Por Molécula')).toBeInTheDocument();
    expect(within(drv33).getByText('18/06/2026 → Permanente')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
  });

  it('RN-07: com ?status=aprovado o header segue mostrando os pendentes da coleção', async () => {
    navigationState.search = 'status=aprovado';
    const { useCases } = setup();
    expect(await header().findByText('2 pendentes')).toBeInTheDocument();
    expect(useCases.aprovacoes.list.execute).toHaveBeenCalledWith({
      filtro: { q: '', ini: '', fim: '', tipo: '', status: 'aprovado' },
      page: 1,
    });
  });
});

describe('AprovacoesScreen — CA-02 filtros', () => {
  it('busca grava q só após 300 ms e sem page; Limpar filtros zera', async () => {
    navigationState.search = 'tipo=%F0%9F%93%BA+TV+Aberta&page=2';
    const { user } = setup();
    await screen.findByRole('list', { name: 'Fila de aprovação' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Busca' }), { target: { value: 'bari' } });
    expect(routerMock.replace).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith(
        '/admin/aprovacoes?tipo=%F0%9F%93%BA+TV+Aberta&q=bari',
        { scroll: false },
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/aprovacoes', { scroll: false });
    expect(screen.getByRole('textbox', { name: 'Busca' })).toHaveValue('');
  });

  it('status, tipo e datas gravam na URL', async () => {
    const { user } = setup();
    await screen.findByRole('list', { name: 'Fila de aprovação' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'rejeitado');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/aprovacoes?status=rejeitado', {
      scroll: false,
    });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo de Driver' }), '🚨 Recall');
    expect(routerMock.replace).toHaveBeenLastCalledWith(
      `/admin/aprovacoes?tipo=${encodeURIComponent('🚨 Recall').replace(/%20/g, '+')}`,
      { scroll: false },
    );
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-06-01' } });
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/aprovacoes?ini=2026-06-01', {
      scroll: false,
    });
  });
});

describe('AprovacoesScreen — CA-05 CA-07 CA-08 CA-09', () => {
  it('Aprovar muda na hora e a falha desfaz com toast', async () => {
    let rejeitar: (error: unknown) => void = () => undefined;
    const aprovar = vi.fn(
      () => new Promise<{ toast: string }>((_resolve, reject) => (rejeitar = reject)),
    );
    const { user } = setup({ aprovacoes: { aprovar: { execute: aprovar } } });
    await header().findByText('2 pendentes');
    await user.click(await screen.findByRole('button', { name: 'Aprovar DRV-2026-034' }));
    expect(await header().findByText('1 pendente')).toBeInTheDocument();
    expect(card('DRV-2026-034')).toHaveClass('border-l-apsen-green');
    rejeitar(new Error('500'));
    expect(await header().findByText('2 pendentes')).toBeInTheDocument();
    expect(
      await screen.findByText('Não foi possível salvar as alterações', { exact: false }),
    ).toBeInTheDocument();
  });

  it('Rejeitar abre o modal; Alterar decisão reabre com toast', async () => {
    const { useCases, user } = setup({
      aprovacoes: {
        list: { execute: vi.fn().mockResolvedValue(listAprovacoesResult(2)) },
      },
    });
    await user.click(
      await screen.findByRole('button', { name: 'Alterar decisão de DRV-2026-026' }),
    );
    expect(useCases.aprovacoes.reabrir.execute).toHaveBeenCalledWith('DRV-2026-026');
    expect(await screen.findByText('Decisão reaberta', { exact: false })).toBeInTheDocument();
    expect(
      within(card('DRV-2026-028')).getByText('🔒 Em uso no Data Lake — não pode alterar'),
    ).toBeInTheDocument();
  });

  it('Rejeitar abre o modal de rejeição', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Rejeitar DRV-2026-034' }));
    expect(await screen.findByRole('dialog', { name: 'Rejeitar Item' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('trocar de página grava page e rola para o topo', async () => {
    const main = document.createElement('main');
    main.scrollTo = vi.fn();
    document.body.appendChild(main);
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Página 2' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/admin/aprovacoes?page=2', {
      scroll: false,
    });
    expect(main.scrollTo).toHaveBeenCalledWith({ top: 0 });
    main.remove();
  });
});

describe('AprovacoesScreen — CA-10 estados', () => {
  it('carregando, erro com Tentar novamente e vazio', async () => {
    const list = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValue({ cards: [], total: 0, totalPages: 1, pendentesNoResultado: 0 });
    const { user } = setup({ aprovacoes: { list: { execute: list } } });
    expect(screen.getByRole('status', { name: 'Carregando aprovações…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhum registro encontrado')).toBeInTheDocument();
    expect(screen.getByText('Tente ajustar os filtros.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
  });
});
