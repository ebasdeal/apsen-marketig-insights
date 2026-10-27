import { createFakeUsuarioRepository } from '@test/fakes/acessoRepositories';
import { ToggleUsuarioAtivo } from '../ToggleUsuarioAtivo';

describe('ToggleUsuarioAtivo (CA-04)', () => {
  it('dado toggle, quando executa, então PATCH só de ativo', async () => {
    const repository = createFakeUsuarioRepository();
    await new ToggleUsuarioAtivo(repository).execute({ id: '4', ativo: true });
    expect(repository.update).toHaveBeenCalledWith('4', { ativo: true });
  });
});
