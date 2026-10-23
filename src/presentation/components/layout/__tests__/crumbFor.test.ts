import { crumbFor } from '../crumbFor';

describe('crumbFor', () => {
  it.each([
    ['/', 'Dashboard'],
    ['/campaigns', 'Campanhas'],
    ['/campaigns/', 'Campanhas'],
    ['/campaigns/abc', 'Detalhe da Campanha'],
    ['/campaigns/abc/', 'Detalhe da Campanha'],
    ['/campaigns/abc/extra', 'Página não encontrada'],
    ['/campaignsx', 'Página não encontrada'],
    ['/qualquer', 'Página não encontrada'],
  ])('pathname %s → %s', (pathname, expected) => {
    expect(crumbFor(pathname)).toBe(expected);
  });
});
