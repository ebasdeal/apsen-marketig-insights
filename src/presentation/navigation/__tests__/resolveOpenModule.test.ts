import { nextAccordion, resolveOpenModule } from '../resolveOpenModule';

describe('resolveOpenModule', () => {
  it.each([
    ['sem escolha e sem módulo abre Drivers', null, '/', null, 'drivers'],
    ['tela de módulo abre o seu módulo', 'admin', '/admin/ciclos', null, 'admin'],
    [
      'escolha manual na mesma rota vence',
      'admin',
      '/admin/ciclos',
      { module: 'analises', atPath: '/admin/ciclos' },
      'analises',
    ],
    [
      'escolha de fechar tudo na mesma rota',
      'admin',
      '/admin/ciclos',
      { module: null, atPath: '/admin/ciclos' },
      null,
    ],
    [
      'tela de módulo vence escolha de outra rota',
      'planos',
      '/planos',
      { module: 'analises', atPath: '/' },
      'planos',
    ],
    [
      'tela sem módulo mantém a última escolha',
      null,
      '/acesso-negado',
      { module: 'analises', atPath: '/' },
      'analises',
    ],
    [
      'tela sem módulo com escolha de fechar volta a Drivers',
      null,
      '/xyz',
      { module: null, atPath: '/' },
      'drivers',
    ],
  ] as const)('%s', (_caso, modulo, pathname, accordion, esperado) => {
    expect(resolveOpenModule(modulo, pathname, accordion)).toBe(esperado);
  });
});

describe('nextAccordion', () => {
  it('fecha o aberto e abre outro', () => {
    expect(nextAccordion('drivers', 'drivers')).toBeNull();
    expect(nextAccordion('drivers', 'analises')).toBe('analises');
    expect(nextAccordion(null, 'planos')).toBe('planos');
  });
});
