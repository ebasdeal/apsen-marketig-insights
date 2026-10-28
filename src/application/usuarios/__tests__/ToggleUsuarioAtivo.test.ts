import { createFakeUsuarioRepository } from '@test/fakes/acessoRepositories';
import { ToggleUsuarioAtivo } from '../ToggleUsuarioAtivo';

describe('ToggleUsuarioAtivo (CA-04)', () => {
  it('dado toggle, quando executa, então PATCH de ativo com quem alterou e quando', async () => {
    const repository = createFakeUsuarioRepository();
    const now = () => new Date('2026-10-27T17:05:00.000Z');
    await new ToggleUsuarioAtivo(repository, now).execute({
      id: '4',
      ativo: true,
      alteradoPor: 'Ana Admin',
    });
    expect(repository.update).toHaveBeenCalledWith('4', {
      ativo: true,
      alteradoPor: 'Ana Admin',
      alteradoEm: '2026-10-27T17:05:00.000Z',
    });
  });
});
