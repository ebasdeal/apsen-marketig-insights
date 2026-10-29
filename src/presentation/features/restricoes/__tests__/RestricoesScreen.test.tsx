import type { ListRestricoesInput } from '@application/restricoes/dto';
import {
  createFakeRestricoesUseCases,
  restricaoItemFixture,
  restricoesPaginaFixture,
} from '@test/fakes/restricoes';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { RestricoesScreen } from '../RestricoesScreen';

function setup(restricoes = {}) {
  navigationState.pathname = '/restricoes';
  const useCases = createFakeUseCases({
    restricoes: createFakeRestricoesUseCases({
      contar: { execute: vi.fn().mockResolvedValue({ ativas: 8, resolvidas: 14 }) },
      list: { execute: vi.fn().mockResolvedValue(restricoesPaginaFixture()) },
      ...restricoes,
    }),
  });
  return { ...renderWithProviders(<RestricoesScreen />, useCases), useCases };
}

describe('RestricoesScreen', () => {
  it('CA-01: cabeçalho, botão vermelho e banner', async () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Restrições & Alertas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Registrar Restrição' })).toHaveClass(
      'bg-apsen-red',
    );
    const nota = screen.getByRole('note');
    expect(nota).toHaveTextContent('Restrição vs. Driver de Demanda — qual a diferença?');
    expect(within(nota).getByText('Atenção:')).toBeInTheDocument();
    expect(await screen.findByText('Falta de IFA — Baricitinibe')).toBeInTheDocument();
  });

  it('CA-02 / RN-01 / RN-10: contadores, aba da URL e troca de aba', async () => {
    navigationState.search = 'aba=resolvidas&pagina=2';
    const { user, useCases } = setup();
    const resolvidas = await screen.findByRole('tab', { name: 'Resolvidas 14' });
    expect(resolvidas).toHaveAttribute('aria-selected', 'true');
    expect(useCases.restricoes.list.execute).toHaveBeenCalledWith({ aba: 'resolvidas', pagina: 2 });
    await user.click(screen.getByRole('tab', { name: 'Ativas 8' }));
    expect(routerMock.replace).toHaveBeenCalledWith('/restricoes', { scroll: false });
  });

  it('CA-03: pagina no servidor e mostra o intervalo', async () => {
    navigationState.search = 'pagina=2';
    const { user, useCases } = setup({
      list: {
        execute: vi.fn(async ({ pagina }: ListRestricoesInput) =>
          restricoesPaginaFixture({ total: 22, pagina }),
        ),
      },
    });
    expect(await screen.findByText('Mostrando 11–20 de 22')).toBeInTheDocument();
    expect(useCases.restricoes.list.execute).toHaveBeenCalledWith({ aba: 'ativas', pagina: 2 });
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(routerMock.replace).toHaveBeenCalledWith('/restricoes?pagina=3', { scroll: false });
  });

  it('CA-06 / RN-02: vazio com ✅ em Ativas e 📋 em Resolvidas', async () => {
    const vazio = {
      list: {
        execute: vi.fn().mockResolvedValue(restricoesPaginaFixture({ itens: [], total: 0 })),
      },
    };
    const { unmount } = setup(vazio);
    expect(await screen.findByText('Nenhum registro')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
    unmount();
    navigationState.search = 'aba=resolvidas';
    setup(vazio);
    expect(await screen.findByText('📋')).toBeInTheDocument();
  });

  it('página além do total mostra o vazio com a paginação', async () => {
    navigationState.search = 'pagina=9';
    setup({
      list: {
        execute: vi
          .fn()
          .mockResolvedValue(restricoesPaginaFixture({ itens: [], total: 8, pagina: 9 })),
      },
    });
    expect(await screen.findByText('Nenhum registro')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 0–0 de 8')).toBeInTheDocument();
  });

  it('CA-11: carregando, erro e "Tentar novamente"', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('500'))
      .mockResolvedValue(restricoesPaginaFixture());
    const { user } = setup({ list: { execute } });
    expect(screen.getByText('Carregando restrições…')).toBeInTheDocument();
    const alerta = await screen.findByRole('alert');
    await user.click(within(alerta).getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Falta de IFA — Baricitinibe')).toBeInTheDocument();
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('CA-07 / CA-08 / CA-09: abre o modal novo, edita e resolve', async () => {
    const { user, useCases } = setup();
    const item = restricaoItemFixture();
    await user.click(await screen.findByRole('button', { name: `Editar ${item.desc}` }));
    const edicao = await screen.findByRole('dialog');
    expect(within(edicao).getByRole('textbox', { name: 'Descrição' })).toHaveValue(item.desc);
    await user.click(within(edicao).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '+ Registrar Restrição' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Registrar Restrição');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: `Marcar ${item.desc} como resolvida` }));
    expect(useCases.restricoes.resolver.execute).toHaveBeenCalledWith(item.id);
    expect(await screen.findByText('Restrição marcada como resolvida.')).toBeInTheDocument();
  });
});
