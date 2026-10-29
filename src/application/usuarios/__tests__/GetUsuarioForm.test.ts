import { NotFoundError } from '@domain/shared/DomainError';
import { createFakeUsuarioRepository } from '@test/fakes/acessoRepositories';
import { buildUsuario } from '@test/fixtures/usuarios';
import { GetUsuarioForm } from '../GetUsuarioForm';

describe('GetUsuarioForm (CA-08)', () => {
  it('dado área "S&OP", quando executa, então areaExtra', async () => {
    const repository = createFakeUsuarioRepository();
    const form = await new GetUsuarioForm(repository).execute('1');
    expect(repository.get).toHaveBeenCalledWith('1');
    expect(form.areaExtra).toBe('S&OP');
    expect(form.draft).toEqual({
      nome: 'Ana Admin',
      email: 'ana.admin@apsen.com.br',
      area: 'S&OP',
      perfil: 'admin',
      categorias: [],
      ativo: true,
    });
  });

  it('usuário de Área traz as categorias e área conhecida não é extra', async () => {
    const repository = createFakeUsuarioRepository();
    repository.get.mockResolvedValueOnce(buildUsuario({ categorias: ['midia', 'comercial'] }));
    const form = await new GetUsuarioForm(repository).execute('3');
    expect(form.areaExtra).toBeNull();
    expect(form.draft.categorias).toEqual(['midia', 'comercial']);
  });

  it('usuário criado no primeiro acesso (área vazia) não gera área extra', async () => {
    const repository = createFakeUsuarioRepository();
    repository.get.mockResolvedValueOnce(
      buildUsuario({ id: 'c0a8-uuid', area: '', perfil: 'viewer' }),
    );
    expect((await new GetUsuarioForm(repository).execute('c0a8-uuid')).areaExtra).toBeNull();
  });

  it('404 → NotFoundError', async () => {
    const repository = createFakeUsuarioRepository();
    repository.get.mockRejectedValueOnce(new NotFoundError('Usuário', '99'));
    await expect(new GetUsuarioForm(repository).execute('99')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
