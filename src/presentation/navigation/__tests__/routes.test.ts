import { ACCESS_DENIED_ROUTE, HOME_ROUTE } from '../routes';

describe('routes', () => {
  it('expõe as rotas fixas do shell', () => {
    expect(HOME_ROUTE).toBe('/');
    expect(ACCESS_DENIED_ROUTE).toBe('/acesso-negado');
  });
});
