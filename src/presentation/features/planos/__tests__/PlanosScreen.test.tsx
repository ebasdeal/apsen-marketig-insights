import type { PlanoFiltro } from '@domain/planos/PlanoItem';
import {
  createFakePlanosUseCases,
  planoItemRowFixture,
  planoListFixture,
} from '@test/fakes/planos';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { loginAs } from '@test/resetStores';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { PlanosScreen } from '../PlanosScreen';

const PENDENTE = planoItemRowFixture({
  id: 'PLP-2026-07-005',
  codigo: 'PLP-2026-07-005',
  status: 'pendente',
  statusLabel: 'Pendente',
  editavel: true,
});

function setup(planos = {}) {
  navigationState.pathname = '/planos';
  const useCases = createFakeUseCases({
    planos: createFakePlanosUseCases({
      list: {
        execute: vi.fn(async (filtro: PlanoFiltro) =>
          planoListFixture({ itens: [planoItemRowFixture(), PENDENTE], pagina: filtro.pagina }),
        ),
      },
      ...planos,
    }),
  });
  return { ...renderWithProviders(<PlanosScreen />, useCases), useCases };
}

describe('PlanosScreen', () => {
  it('CA-01 / RN-08: título com ciclo, botão e ScreenDesc', async () => {
    setup();
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Planos de Produção — PLP-2026-07' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: '+ Incluir Item' }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('acurácia deste plano').tagName).toBe('EM');
  });

  it('CA-01: sem ciclo ativo, título sem sufixo e "Ciclo —"', async () => {
    setup({ list: { execute: vi.fn().mockResolvedValue(planoListFixture({ ciclo: null })) } });
    expect(await screen.findByText(/itens no plano · Ciclo —/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Planos de Produção' })).toBeInTheDocument();
  });

  it('CA-02: contador, paginação e troca de tamanho', async () => {
    const { user } = setup();
    expect(await screen.findByText('Mostrando 1–10 de 247')).toBeInTheDocument();
    expect(screen.getByText('247').closest('p')).toHaveTextContent(
      '247 itens no plano · Ciclo PLP-2026-07',
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Itens por página' }), '25');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/planos?tamanho=25', { scroll: false });
    await user.click(screen.getByRole('button', { name: 'Página 2' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/planos?pagina=2', { scroll: false });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'bloqueado');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/planos?status=bloqueado', {
      scroll: false,
    });
  });

  it('CA-03 / RN-01: busca com debounce de 300 ms e filtros voltam à página 1', async () => {
    navigationState.search = 'pagina=3';
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setup();
    await screen.findByText('Mostrando 21–30 de 247');
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar itens do plano' }), {
      target: { value: 'bari' },
    });
    act(() => vi.advanceTimersByTime(200));
    expect(routerMock.replace).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(150));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/planos?busca=bari', { scroll: false });
    fireEvent.change(screen.getByRole('combobox', { name: 'Família' }), {
      target: { value: 'Cardio' },
    });
    expect(routerMock.replace).toHaveBeenLastCalledWith('/planos?familia=Cardio', {
      scroll: false,
    });
    vi.useRealTimers();
  });

  it('CA-04 / RN-02: ordenar alterna e preserva a página', async () => {
    navigationState.search = 'pagina=2&ordem=codigo-asc';
    const { user, useCases } = setup();
    await screen.findByText('Mostrando 11–20 de 247');
    expect(useCases.planos.list.execute).toHaveBeenCalledWith(
      expect.objectContaining({ ordem: { campo: 'codigo', direcao: 'asc' }, pagina: 2 }),
    );
    expect(screen.getByRole('columnheader', { name: 'Código' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await user.click(screen.getByRole('button', { name: 'Código' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/planos?pagina=2&ordem=codigo-desc', {
      scroll: false,
    });
    await user.click(screen.getByRole('button', { name: 'Qtd. Planejada' }));
    expect(routerMock.replace).toHaveBeenLastCalledWith('/planos?pagina=2&ordem=qtd-asc', {
      scroll: false,
    });
  });

  it('CA-06 / RN-07: excluir confirma, remove e mostra o toast', async () => {
    const { user, useCases } = setup();
    await user.click(await screen.findByRole('button', { name: 'Excluir PLP-2026-07-005' }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent('Excluir o item PLP-2026-07-005 do plano?');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(useCases.planos.excluir.execute).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Excluir PLP-2026-07-005' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }));
    expect(useCases.planos.excluir.execute).toHaveBeenCalledWith('PLP-2026-07-005');
    expect(await screen.findByText('🗑️ Item removido do plano.')).toBeInTheDocument();
  });

  it('abre e fecha o modal de inclusão', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: '+ Incluir Item' }));
    expect(
      await screen.findByRole('dialog', { name: 'Incluir Item no Plano' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('RN da decisão de perfis: Área e Visualizador não veem ações de escrita', async () => {
    loginAs('area');
    setup();
    expect(await screen.findByText('PLP-2026-07-005')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Incluir Item' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Excluir/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Visualizar PLP-2026-07-005' })).toBeInTheDocument();
  });

  it('CA-12: carregando, erro com "Tentar novamente" e vazio', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValue(planoListFixture({ itens: [], total: 0 }));
    const { user } = setup({ list: { execute } });
    expect(screen.getByText('Carregando itens do plano…')).toBeInTheDocument();
    const alerta = await screen.findByRole('alert');
    await user.click(within(alerta).getByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByText('Nenhum item encontrado com os filtros atuais.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Mostrando 0–0 de 0')).toBeInTheDocument();
  });
});
