import { HttpError } from '@infrastructure/http/HttpClient';
import {
  FONTE_CUSTOM,
  FONTES_FIXTURE,
  FONTES_PAGE_FIXTURE,
  fonteCard,
} from '@test/fixtures/fontes';
import { navigationState, routerMock } from '@test/nextNavigation';
import {
  createFakeUseCases,
  renderWithProviders,
  type FakeUseCasesOverrides,
} from '@test/renderWithProviders';
import { screen, waitFor, within } from '@testing-library/react';
import { FontesScreen } from '../FontesScreen';

const FALHA = 'Não foi possível salvar as alterações. Tente novamente.';

function render(fontes: FakeUseCasesOverrides['fontes'] = {}) {
  const useCases = createFakeUseCases({ fontes });
  return { useCases, ...renderWithProviders(<FontesScreen />, useCases) };
}

beforeEach(() => {
  navigationState.pathname = '/admin/fontes';
});

describe('FontesScreen', () => {
  it('CA-01 CA-02 header, descrição e 4 cards mock sem remover', async () => {
    const page = { items: FONTES_FIXTURE.map(fonteCard), total: 4, totalPages: 1 };
    render({ list: { execute: vi.fn().mockResolvedValue(page) } });
    expect(screen.getByRole('heading', { name: 'Fontes de Dados / APIs' })).toBeInTheDocument();
    expect(screen.getByText('Configuração de integrações externas · Admin DI')).toBeInTheDocument();
    expect(screen.getByText(/As alterações valem para todos os formulários/)).toBeInTheDocument();
    expect(await screen.findAllByText('📦 Lista interna (mock)')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /Remover a fonte/ })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Configurar Concorrentes / Marcas' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).toBeNull();
  });

  it('CA-02 fonte API mostra a pill verde e a linha mono', async () => {
    render();
    const card = (await screen.findByRole('heading', { name: 'Distribuidores' })).closest(
      'article',
    )!;
    expect(within(card as HTMLElement).getByText('🔌 API externa ativa')).toHaveClass(
      'text-apsen-green-fg',
    );
    expect(
      within(card as HTMLElement).getByText(
        'GET https://api.apsen.com.br/v1/distribuidores · auth: bearer · cache: 60min',
      ),
    ).toHaveClass('font-mono');
  });

  it('CA-07 confirmar remove o card na hora e mostra o toast', async () => {
    let resolve!: (value: { toast: string }) => void;
    const execute = vi.fn(() => new Promise<{ toast: string }>((res) => (resolve = res)));
    const { user, useCases } = render({ remove: { execute } });
    await user.click(await screen.findByRole('button', { name: 'Remover a fonte Distribuidores' }));
    const dialog = screen.getByRole('dialog', { name: 'Remover a fonte "Distribuidores"?' });
    await user.click(within(dialog).getByRole('button', { name: 'Remover' }));
    expect(useCases.fontes.remove.execute).toHaveBeenCalledWith({
      id: FONTE_CUSTOM.id,
      removivel: true,
    });
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Distribuidores' })).toBeNull(),
    );
    resolve({ toast: 'Fonte removida.' });
    expect(await screen.findByText('Fonte removida.')).toBeInTheDocument();
  });

  it('CA-07 falha restaura o card e mostra o toast de falha', async () => {
    const execute = vi.fn().mockRejectedValue(new HttpError(500, '/fontes', {}));
    const { user } = render({
      remove: { execute },
      list: { execute: vi.fn().mockResolvedValue(FONTES_PAGE_FIXTURE) },
    });
    await user.click(await screen.findByRole('button', { name: 'Remover a fonte Distribuidores' }));
    await user.click(screen.getByRole('button', { name: 'Remover' }));
    expect(await screen.findByText(FALHA)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Distribuidores' })).toBeInTheDocument();
  });

  it('cancelar a remoção não chama a API', async () => {
    const { user, useCases } = render();
    await user.click(await screen.findByRole('button', { name: 'Remover a fonte Distribuidores' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(useCases.fontes.remove.execute).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('abre o modal de nova fonte e o de configuração', async () => {
    const { user } = render();
    await user.click(screen.getByRole('button', { name: '+ Nova Fonte de Dados' }));
    expect(await screen.findByRole('dialog', { name: 'Nova Fonte de Dados' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(await screen.findByRole('button', { name: 'Configurar Distribuidores' }));
    expect(
      await screen.findByRole('dialog', { name: 'Configurar: Distribuidores' }),
    ).toBeInTheDocument();
  });

  it('paginação grava a página na URL', async () => {
    const { user } = render({
      list: {
        execute: vi.fn().mockResolvedValue({ ...FONTES_PAGE_FIXTURE, total: 15, totalPages: 2 }),
      },
    });
    await user.click(await screen.findByRole('button', { name: 'Página 2' }));
    expect(routerMock.replace).toHaveBeenCalledWith('/admin/fontes?page=2', { scroll: false });
  });

  it('CA-08 carregando, erro e vazio', async () => {
    const pending = render({ list: { execute: vi.fn(() => new Promise<never>(() => undefined)) } });
    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    pending.unmount();
    const execute = vi.fn().mockRejectedValue(new HttpError(500, '/fontes', {}));
    const failing = render({ list: { execute } });
    await failing.user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));
    failing.unmount();
    render({
      list: { execute: vi.fn().mockResolvedValue({ items: [], total: 0, totalPages: 0 }) },
    });
    expect(await screen.findByText('Nenhuma fonte cadastrada')).toBeInTheDocument();
    expect(
      screen.getByText('Clique em "+ Nova Fonte de Dados" para configurar a primeira.'),
    ).toBeInTheDocument();
  });
});
