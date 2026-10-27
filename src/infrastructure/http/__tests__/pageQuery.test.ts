import { toPageQuery } from '../pageQuery';

describe('toPageQuery', () => {
  it('gera página e limite', () => {
    expect(toPageQuery({ page: 2, limit: 25 })).toEqual({ _page: '2', _limit: '25' });
  });

  it('inclui ordenação, busca e filtros sem valores vazios', () => {
    expect(
      toPageQuery({
        page: 1,
        limit: 10,
        sort: 'codigo',
        order: 'desc',
        search: '  motilex ',
        filters: { status: 'ativa', categoria: '', tipo: '  ' },
      }),
    ).toEqual({
      _page: '1',
      _limit: '10',
      _sort: 'codigo',
      _order: 'desc',
      q: 'motilex',
      status: 'ativa',
    });
  });

  it('usa ordem ascendente por padrão e ignora busca e ordenação vazias', () => {
    expect(toPageQuery({ page: 1, limit: 10, sort: 'nome' })).toMatchObject({
      _sort: 'nome',
      _order: 'asc',
    });
    expect(toPageQuery({ page: 1, limit: 10, sort: ' ', search: '' })).toEqual({
      _page: '1',
      _limit: '10',
    });
  });
});
