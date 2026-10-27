import { UsuarioProtegidoError } from '@domain/usuarios/errors';
import { createFakeUsuarioRepository } from '@test/fakes/acessoRepositories';
import { DeleteUsuario } from '../DeleteUsuario';

describe('DeleteUsuario (RN-05, CA-05)', () => {
  it('dado Ana Admin (removivel false), quando executa, então recusa', async () => {
    const repository = createFakeUsuarioRepository();
    await expect(new DeleteUsuario(repository).execute('1')).rejects.toBeInstanceOf(
      UsuarioProtegidoError,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('outro usuário é removido com o toast', async () => {
    const repository = createFakeUsuarioRepository();
    await expect(new DeleteUsuario(repository).execute('2')).resolves.toEqual({
      toast: '🗑 Usuário removido.',
    });
    expect(repository.delete).toHaveBeenCalledWith('2');
  });
});
