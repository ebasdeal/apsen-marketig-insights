import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SCREENS, matchScreen, screenHref } from '../screens';

const db = JSON.parse(
  readFileSync(resolve(__dirname, '../../../../mock-api/db.json'), 'utf-8'),
) as {
  config: { crumbMap: Record<string, string>; SCREEN_ROLES: Record<string, number> };
};

describe('SCREENS', () => {
  it('registra as 25 telas do inventário', () => {
    expect(SCREENS).toHaveLength(25);
    expect(new Set(SCREENS.map((screen) => screen.id)).size).toBe(25);
  });

  it('usa os crumbs e níveis do config do protótipo', () => {
    expect(Object.fromEntries(SCREENS.map((screen) => [screen.id, screen.crumb]))).toEqual(
      db.config.crumbMap,
    );
    const niveis = Object.fromEntries(
      SCREENS.filter((screen) => screen.nivelMinimo !== null).map((screen) => [
        screen.id,
        screen.nivelMinimo,
      ]),
    );
    expect(niveis).toEqual(db.config.SCREEN_ROLES);
    expect(matchScreen('/acesso-negado')).toMatchObject({ nivelMinimo: null, modulo: null });
  });
});

describe('matchScreen', () => {
  it.each([
    ['/', 'dashboard'],
    ['/drivers/novo', 'form'],
    ['/drivers/ABC', 'form'],
    ['/drivers/ABC/editar', 'form'],
    ['/drivers', 'lista'],
    ['/drivers/', 'lista'],
    ['/drivers?familia=X', 'lista'],
    ['/drivers/catalogo', 'catalogo'],
    ['/drivers/catalogo/MOTILEX%20HA', 'catalogo-drivers'],
    ['/drivers/exportar', 'export'],
    ['/admin/ciclos', 'ciclos'],
    ['/admin/tipos', 'tipos'],
    ['/admin/tipos/novo', 'tipo-form'],
    ['/admin/tipos/ruptura/editar', 'tipo-form'],
    ['/admin/aprovacoes', 'aprovacoes'],
    ['/admin/ingeridos', 'ingeridos'],
    ['/admin/fontes', 'fontes'],
    ['/acesso/usuarios', 'usuarios'],
    ['/acesso/usuarios/novo', 'user-form'],
    ['/acesso/usuarios/u1/editar', 'user-form'],
    ['/acesso/perfis', 'perfis'],
    ['/agentes', 'agentes'],
    ['/agentes/novo', 'agente-form'],
    ['/agentes/a1/editar', 'agente-form'],
    ['/analises', 'analises'],
    ['/analises/nova', 'analise-form'],
    ['/analises/an-1', 'analise-view'],
    ['/restricoes', 'restricoes'],
    ['/planos', 'planos'],
    ['/planos/1', 'plano-item'],
    ['/relatorios', 'relatorios'],
    ['/acesso-negado', 'denied'],
  ])('%s → %s', (pathname, id) => {
    expect(matchScreen(pathname)?.id).toBe(id);
  });

  it.each(['/nada', '/drivers/a/b/c', '/admin', '/planos/1/x'])('%s → null', (pathname) => {
    expect(matchScreen(pathname)).toBeNull();
  });
});

describe('screenHref', () => {
  it('monta a rota da tela codificando parâmetros', () => {
    expect(screenHref('catalogo-drivers', { familia: 'MOTILEX HA + MSM' })).toBe(
      '/drivers/catalogo/MOTILEX%20HA%20%2B%20MSM',
    );
    expect(screenHref('form')).toBe('/drivers/novo');
    expect(screenHref('form', { id: 'DRV-1' })).toBe('/drivers/DRV-1');
    expect(screenHref('dashboard')).toBe('/');
  });

  it('rejeita parâmetros que a tela não aceita', () => {
    expect(() => screenHref('lista', { id: 'x' })).toThrow(
      'Rota da tela lista não aceita os parâmetros [id]',
    );
  });
});
