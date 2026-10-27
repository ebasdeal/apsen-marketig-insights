import { NAV_BADGE_CONTAGENS } from '../NavBadges';

describe('NAV_BADGE_CONTAGENS', () => {
  it('mapeia cada badge para a coleção e o filtro da API', () => {
    expect(NAV_BADGE_CONTAGENS.aprovacoes).toEqual({
      colecao: 'aprovacoes',
      filtro: { status: 'pendente' },
    });
    expect(NAV_BADGE_CONTAGENS.restricoes).toEqual({
      colecao: 'restricoes',
      filtro: { status: 'ativa' },
    });
    expect(NAV_BADGE_CONTAGENS.planos).toEqual({ colecao: 'planoItens' });
    expect(NAV_BADGE_CONTAGENS.lista).toEqual({ colecao: 'drivers' });
    expect(Object.keys(NAV_BADGE_CONTAGENS)).toHaveLength(9);
  });
});
