import { createFakeUsuarioRepository } from '@test/fakes/acessoRepositories';
import { buildUsuario } from '@test/fixtures/usuarios';
import { ListUsuarios } from '../ListUsuarios';

describe('ListUsuarios (RN-01, CA-02)', () => {
  it('dado filtros, quando executa, então repassa ao repositório e monta resumo', async () => {
    const repository = createFakeUsuarioRepository();
    repository.listPage.mockResolvedValueOnce({
      items: [buildUsuario()],
      total: 1,
      page: 1,
      limit: 10,
    });
    const result = await new ListUsuarios(repository).execute({
      q: 'mkt',
      perfil: 'area',
      page: 1,
    });
    expect(repository.listPage).toHaveBeenCalledWith(
      { q: 'mkt', perfil: 'area' },
      { page: 1, size: 10 },
    );
    expect(result.resumo).toBe('1 usuário');
    expect(result.totalPages).toBe(1);
    expect(result.rows[0]).toMatchObject({ id: '3', perfilTone: 'teal', perfilLabel: 'Área' });
    expect(result.rows[0]).not.toHaveProperty('categorias');
  });

  it('dado a massa, então 4 usuários, ids string e páginas pelo tamanho', async () => {
    const repository = createFakeUsuarioRepository();
    repository.listPage.mockImplementationOnce(async (_filtro, { page, size }) => ({
      items: [],
      total: 23,
      page,
      limit: size,
    }));
    expect((await new ListUsuarios(repository).execute({ page: 3 })).totalPages).toBe(3);
    const massa = await new ListUsuarios(repository).execute({ page: 1, size: 25 });
    expect(massa.resumo).toBe('4 usuários');
    expect(massa.rows.map((row) => row.id)).toEqual(['1', '2', '3', '4']);
    expect(repository.listPage).toHaveBeenLastCalledWith({}, { page: 1, size: 25 });
  });
});
