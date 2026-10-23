import { CAMPAIGNS_ROUTE, campaignDetailsRoute } from '../routes';

describe('routes', () => {
  it('expõe a rota da lista de campanhas', () => {
    expect(CAMPAIGNS_ROUTE).toBe('/campaigns');
  });

  it('monta a rota de detalhe codificando o id', () => {
    expect(campaignDetailsRoute('cmp-1')).toBe('/campaigns/cmp-1');
    expect(campaignDetailsRoute('a b/c')).toBe('/campaigns/a%20b%2Fc');
  });
});
