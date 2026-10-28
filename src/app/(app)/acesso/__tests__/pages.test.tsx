import { renderWithProviders } from '@test/renderWithProviders';
import { screen } from '@testing-library/react';
import EditarUsuarioPage, { metadata as editarMeta } from '../usuarios/[id]/editar/page';
import EditarUsuarioLoading from '../usuarios/[id]/editar/loading';
import UsuarioNotFound from '../usuarios/[id]/editar/not-found';
import UsuariosLoading from '../usuarios/loading';
import NovoUsuarioPage, { metadata as novoMeta } from '../usuarios/novo/page';
import UsuariosPage, { metadata as usuariosMeta } from '../usuarios/page';
import PerfisLoading from '../perfis/loading';
import PerfisPage, { metadata as perfisMeta } from '../perfis/page';

describe('rotas de Controle de Acesso', () => {
  it('definem os títulos', () => {
    expect(usuariosMeta.title).toBe('Usuários');
    expect(novoMeta.title).toBe('Novo Usuário');
    expect(editarMeta.title).toBe('Editar Usuário');
    expect(perfisMeta.title).toBe('Perfis de Acesso');
  });

  it('renderizam as telas', async () => {
    renderWithProviders(<UsuariosPage />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Usuários' })).toBeInTheDocument();
  });

  it('novo e perfis renderizam', async () => {
    renderWithProviders(
      <>
        <NovoUsuarioPage />
        <PerfisPage />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Salvar Usuário' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Perfis de Acesso' })).toBeInTheDocument();
  });

  it('edição aguarda params (Promise)', async () => {
    const page = await EditarUsuarioPage({
      params: Promise.resolve({ id: '3' }),
    } as Parameters<typeof EditarUsuarioPage>[0]);
    renderWithProviders(page);
    expect(await screen.findByDisplayValue('Fernanda Marketing')).toBeInTheDocument();
  });

  it('loading e not-found', () => {
    renderWithProviders(
      <>
        <UsuariosLoading />
        <EditarUsuarioLoading />
        <PerfisLoading />
        <UsuarioNotFound />
      </>,
    );
    expect(screen.getAllByRole('status', { name: 'Carregando…' })).toHaveLength(3);
    expect(screen.getByText('Usuário não encontrado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Voltar' })).toHaveAttribute(
      'href',
      '/acesso/usuarios',
    );
  });
});
