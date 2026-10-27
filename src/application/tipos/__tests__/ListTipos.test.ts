import { createFakeTipoRepository } from '@test/fakes/tipoRepository';
import { ListCategorias } from '../ListCategorias';
import { ListTipos } from '../ListTipos';

describe('ListTipos (RN-01, CA-01)', () => {
  it('filtra por categoria e traz total e ativos da coleção', async () => {
    const repository = createFakeTipoRepository();
    const result = await new ListTipos(repository).execute({ page: 1, size: 10, cat: 'midia' });
    expect(repository.listPage).toHaveBeenCalledWith({ page: 1, size: 10, cat: 'midia' });
    expect(repository.count).toHaveBeenCalledWith();
    expect(repository.count).toHaveBeenCalledWith({ ativo: true });
    expect(result).toMatchObject({ filtrados: 6, total: 47, ativos: 45, totalPages: 1 });
    expect(result.rows[0]).toEqual({
      id: 'tv',
      slug: 'tv',
      label: '📺 TV Aberta',
      catL: '📡 Mídia',
      dono: 'Marketing',
      feature: 'continua_grp',
      featureTone: 'teal',
      lagTxt: '+1',
      params: 6,
      ativo: true,
    });
  });

  it('"Todos" não envia cat e pagina', async () => {
    const repository = createFakeTipoRepository();
    const result = await new ListTipos(repository).execute({ page: 5, size: 10 });
    expect(repository.listPage).toHaveBeenCalledWith({ page: 5, size: 10 });
    expect(result).toMatchObject({ filtrados: 47, totalPages: 5 });
    expect(result.rows).toHaveLength(7);
  });
});

describe('ListCategorias', () => {
  it('devolve as 10 categorias ordenadas por id', async () => {
    const repository = createFakeTipoRepository();
    repository.listCategorias.mockResolvedValueOnce([...repository.categorias].reverse());
    const categorias = await new ListCategorias(repository).execute();
    expect(categorias.map((categoria) => categoria.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
