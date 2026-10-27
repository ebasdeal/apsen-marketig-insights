import type { CiclosPageDto } from '@application/ciclos/dto';
import { HttpError } from '@infrastructure/http/HttpClient';
import {
  CICLO_RASCUNHO,
  CICLOS_PAGE_FIXTURE,
  CICLOS_RESUMO_FIXTURE,
  cicloRow,
} from '@test/fixtures/ciclos';
import { navigationState, routerMock } from '@test/nextNavigation';
import {
  createFakeUseCases,
  renderWithProviders,
  type FakeUseCasesOverrides,
} from '@test/renderWithProviders';
import { loginAs } from '@test/resetStores';
import { screen, waitFor, within } from '@testing-library/react';
import { CiclosScreen } from '../CiclosScreen';

const FALHA = 'Não foi possível salvar as alterações. Tente novamente.';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function render(ciclos: FakeUseCasesOverrides['ciclos'] = {}) {
  const useCases = createFakeUseCases({ ciclos });
  return { useCases, ...renderWithProviders(<CiclosScreen />, useCases) };
}

const COM_RASCUNHO: CiclosPageDto = {
  ...CICLOS_PAGE_FIXTURE,
  rows: [cicloRow(CICLO_RASCUNHO), ...CICLOS_PAGE_FIXTURE.rows],
  total: 4,
};

beforeEach(() => {
  navigationState.pathname = '/admin/ciclos';
});

describe('CiclosScreen', () => {
  it('CA-01 CA-02 CA-03 mostra header, descrição, alerta, resumo e linhas', async () => {
    render();
    expect(screen.getByRole('heading', { name: 'Ciclos de Planejamento' })).toBeInTheDocument();
    expect(
      screen.getByText('Períodos de planejamento de produção vinculados ao pipeline de drivers'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cada ciclo representa um mês de produção/)).toBeInTheDocument();
    expect(await screen.findByText('PLP-2026-07 · Julho 2026')).toBeInTheDocument();
    expect(screen.getByText('3 ciclos')).toBeInTheDocument();
    expect(screen.getByText('1 ativo')).toBeInTheDocument();
    const ativa = screen.getByRole('row', { name: /Planejamento Julho 2026/ });
    expect(ativa).toHaveClass('bg-apsen-row-active');
    expect(within(ativa).getByText('PLP-2026-07')).toHaveClass('font-bold', 'text-apsen-orange');
    expect(screen.getByRole('row', { name: /Planejamento Junho 2026/ })).not.toHaveClass(
      'bg-apsen-row-active',
    );
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).toBeNull();
  });

  it('RN-07 o Planejador vê "+ Novo Ciclo" e abre o modal', async () => {
    loginAs('planejador');
    const { user } = render();
    const novo = screen.getByRole('button', { name: '+ Novo Ciclo' });
    await waitFor(() => expect(novo).toBeEnabled());
    await user.click(novo);
    expect(
      await screen.findByRole('dialog', { name: 'Novo Ciclo de Planejamento' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('CA-09 ✏️ abre o modal de edição', async () => {
    const { user } = render();
    await user.click(await screen.findByRole('button', { name: 'Editar ciclo PLP-2026-07' }));
    const dialog = await screen.findByRole('dialog', { name: 'Editar Ciclo de Planejamento' });
    expect(within(dialog).getByRole('textbox', { name: 'Descrição' })).toHaveValue(
      'Planejamento Julho 2026',
    );
  });

  it('CA-03 pede a página da URL e grava a troca de página', async () => {
    navigationState.search = 'page=2';
    const execute = vi.fn().mockResolvedValue({ ...CICLOS_PAGE_FIXTURE, total: 25, totalPages: 3 });
    const { user, useCases } = render({ list: { execute } });
    await user.click(await screen.findByRole('button', { name: 'Próxima página' }));
    expect(useCases.ciclos.list.execute).toHaveBeenCalledWith({ page: 2, size: 10 });
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
    expect(routerMock.replace).toHaveBeenCalledWith('/admin/ciclos?page=3', { scroll: false });
  });

  it('CA-05 desligar o ativo muda na hora e volta quando a API falha', async () => {
    const pending = deferred<never>();
    const { user } = render({ toggle: { execute: vi.fn(() => pending.promise) } });
    await user.click(await screen.findByRole('switch', { name: 'Ciclo PLP-2026-07 ativo' }));
    const linha = () => screen.getByRole('row', { name: /Planejamento Julho 2026/ });
    await waitFor(() => expect(within(linha()).getByText('Encerrado')).toBeInTheDocument());
    pending.reject(new HttpError(500, '/ciclos', {}));
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
    await waitFor(() => expect(within(linha()).getByText('Ativo')).toBeInTheDocument());
  });

  it('CA-06 ligar um rascunho chama o toggle e mostra o toast', async () => {
    const { user, useCases } = render({
      list: { execute: vi.fn().mockResolvedValue(COM_RASCUNHO) },
    });
    const toggle = await screen.findByRole('switch', { name: 'Ciclo PLP-2026-08 ativo' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(useCases.ciclos.toggle.execute).toHaveBeenCalledWith({
      id: CICLO_RASCUNHO.id,
      ativo: true,
    });
    expect(await screen.findByText('Ciclo ativado como ciclo corrente.')).toBeInTheDocument();
  });

  it('CA-10 carregando', () => {
    render({ list: { execute: vi.fn(() => new Promise<never>(() => undefined)) } });
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
  });

  it('CA-10 erro com "Tentar novamente" refaz a busca', async () => {
    const execute = vi.fn().mockRejectedValue(new HttpError(500, '/ciclos', {}));
    const { user } = render({ list: { execute } });
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
  });

  it('CA-10 vazio mostra a tabela vazia, o alerta sem ativo e 0 ciclos', async () => {
    render({
      list: { execute: vi.fn().mockResolvedValue({ rows: [], total: 0, totalPages: 0 }) },
      resumo: {
        execute: vi
          .fn()
          .mockResolvedValue({ ...CICLOS_RESUMO_FIXTURE, total: 0, ativos: 0, ativo: null }),
      },
    });
    expect(await screen.findByText('Nenhum ciclo cadastrado.')).toBeInTheDocument();
    expect(screen.getByText(/Nenhum ciclo ativo — ative um ciclo/)).toBeInTheDocument();
    expect(screen.getByText('0 ciclos')).toBeInTheDocument();
    expect(screen.getByText('0 ativos')).toBeInTheDocument();
  });
});
