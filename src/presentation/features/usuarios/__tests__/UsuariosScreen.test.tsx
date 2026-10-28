import { createFakeUsuariosUseCases } from '@test/fakes/usuarios';
import { SESSOES } from '@test/fixtures/sessao';
import { USUARIOS_PAGE_FIXTURE } from '@test/fixtures/usuarios';
import { navigationState, routerMock } from '@test/nextNavigation';
import { createFakeUseCases, renderWithProviders } from '@test/renderWithProviders';
import { useSessaoStore } from '@presentation/stores/sessaoStore';
import { act, screen, waitFor, within } from '@testing-library/react';
import { confirmacaoTexto, UsuariosScreen } from '../UsuariosScreen';

function setup(overrides: Parameters<typeof createFakeUsuariosUseCases>[0] = {}) {
  const usuarios = createFakeUsuariosUseCases(overrides);
  const result = renderWithProviders(<UsuariosScreen />, createFakeUseCases({ usuarios }));
  return { ...result, usuarios };
}

function linha(nome: string) {
  return screen.getByRole('row', { name: new RegExp(nome) });
}

describe('UsuariosScreen', { timeout: 20000 }, () => {
  beforeEach(() => {
    navigationState.pathname = '/acesso/usuarios';
  });

  it('CA-01 CA-03 mostra header, resumo e as colunas com a massa', async () => {
    const { usuarios } = setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Usuários' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+ Novo Usuário' })).toHaveAttribute(
      'href',
      '/acesso/usuarios/novo',
    );
    expect(await screen.findByText('4 usuários')).toBeInTheDocument();
    expect(usuarios.list.execute).toHaveBeenCalledWith({ page: 1, size: 10 });
    expect(within(linha('Ana Admin')).getByText('Admin')).toHaveClass('text-apsen-purple');
    expect(screen.queryByRole('button', { name: 'Remover Ana Admin' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remover Pedro Viewer' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Usuário Pedro Viewer ativo' })).not.toBeChecked();
    expect(within(linha('Pedro Viewer')).getByText('Inativo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar Fernanda Marketing' })).toHaveAttribute(
      'href',
      '/acesso/usuarios/3/editar',
    );
  });

  it('CA-02 busca com debounce e perfil vão para a URL', async () => {
    const { user } = setup();
    await screen.findByText('4 usuários');
    await user.type(screen.getByRole('textbox', { name: 'Buscar usuários' }), 'mkt');
    await waitFor(
      () =>
        expect(routerMock.replace).toHaveBeenCalledWith('/acesso/usuarios?q=mkt', {
          scroll: false,
        }),
      { timeout: 2000 },
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Perfil' }), 'area');
    expect(routerMock.replace).toHaveBeenLastCalledWith('/acesso/usuarios?perfil=area', {
      scroll: false,
    });
  });

  it('lê filtros e página da URL e pagina com mais de uma página', async () => {
    navigationState.search = 'q=ana&perfil=admin&page=2';
    const list = {
      execute: vi.fn().mockResolvedValue({ ...USUARIOS_PAGE_FIXTURE, total: 14, totalPages: 2 }),
    };
    const { user } = setup({ list });
    await screen.findByText('4 usuários');
    expect(list.execute).toHaveBeenCalledWith({ q: 'ana', perfil: 'admin', page: 2, size: 10 });
    await user.click(screen.getByRole('button', { name: /1/ }));
    expect(routerMock.replace).toHaveBeenCalled();
  });

  it('CA-04 inativar pede "Tem certeza?" e grava com quem alterou', async () => {
    const { user, usuarios } = setup();
    await screen.findByText('4 usuários');
    await user.click(screen.getByRole('switch', { name: 'Usuário Carlos Planejador ativo' }));
    const dialog = screen.getByRole('dialog', { name: 'Tem certeza?' });
    expect(dialog).toHaveTextContent('Inativar o usuário "Carlos Planejador"?');
    await user.click(within(dialog).getByRole('button', { name: 'Inativar' }));
    await waitFor(() =>
      expect(usuarios.toggle.execute).toHaveBeenCalledWith({
        id: '2',
        ativo: false,
        alteradoPor: 'Ana Admin',
      }),
    );
  });

  it('ativar grava direto; cancelar a confirmação não grava', async () => {
    const { user, usuarios } = setup();
    await screen.findByText('4 usuários');
    await user.click(screen.getByRole('switch', { name: 'Usuário Pedro Viewer ativo' }));
    await waitFor(() =>
      expect(usuarios.toggle.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: '4', ativo: true }),
      ),
    );
    await user.click(screen.getByRole('switch', { name: 'Usuário Ana Admin ativo' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(usuarios.toggle.execute).toHaveBeenCalledTimes(1);
  });

  it('CA-04 falha restaura e mostra o toast de falha', async () => {
    const toggle = { execute: vi.fn().mockRejectedValue(new Error('500')) };
    const { user } = setup({ toggle });
    await screen.findByText('4 usuários');
    await user.click(screen.getByRole('switch', { name: 'Usuário Pedro Viewer ativo' }));
    expect(
      await screen.findByText('Não foi possível salvar as alterações. Tente novamente.'),
    ).toBeInTheDocument();
  });

  it('CA-05 remover confirma e chama a exclusão', async () => {
    const { user, usuarios } = setup();
    await screen.findByText('4 usuários');
    await user.click(screen.getByRole('button', { name: 'Remover Pedro Viewer' }));
    const dialog = screen.getByRole('dialog', { name: 'Tem certeza?' });
    expect(dialog).toHaveTextContent('Remover o usuário "Pedro Viewer"?');
    await user.click(within(dialog).getByRole('button', { name: 'Remover' }));
    await waitFor(() => expect(usuarios.remove.execute).toHaveBeenCalledWith('4'));
    expect(await screen.findByText('🗑 Usuário removido.')).toBeInTheDocument();
  });

  it('mostra quem alterou o usuário', async () => {
    const rows = USUARIOS_PAGE_FIXTURE.rows.map((row) =>
      row.id === '4' ? { ...row, alteracao: 'Alterado por Ana Admin em 27/10/2026 14:05' } : row,
    );
    setup({ list: { execute: vi.fn().mockResolvedValue({ ...USUARIOS_PAGE_FIXTURE, rows }) } });
    expect(
      await screen.findByText('Alterado por Ana Admin em 27/10/2026 14:05'),
    ).toBeInTheDocument();
  });

  it('usuário inativo só visualiza: sem cadastrar, sem remover e chaves desabilitadas', async () => {
    useSessaoStore.setState({
      sessao: { ...SESSOES.admin, usuario: { ...SESSOES.admin.usuario, ativo: false } },
      hidratado: true,
    });
    setup();
    await screen.findByText('4 usuários');
    expect(screen.queryByRole('link', { name: '+ Novo Usuário' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Remover/ })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Usuário Ana Admin ativo' })).toBeDisabled();
  });

  it('CA-11 carregando, erro com "Tentar novamente" e vazio', async () => {
    const list = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(new Error('rede'))
        .mockResolvedValueOnce({ rows: [], total: 0, totalPages: 1, resumo: '0 usuários' }),
    };
    const { user } = setup({ list });
    expect(screen.getByRole('status', { name: 'Carregando…' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhum usuário encontrado.')).toBeInTheDocument();
  });

  it('texto da confirmação por ação', () => {
    const row = USUARIOS_PAGE_FIXTURE.rows[1]!;
    expect(confirmacaoTexto({ acao: 'remover', row })).toBe(
      'Remover o usuário "Carlos Planejador"?',
    );
    act(() => undefined);
  });
});
