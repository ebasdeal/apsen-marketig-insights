import {
  NIVEL_MINIMO_MODULO,
  itemVisivel,
  moduloVisivel,
  podeAcessar,
  upgradeNivel,
  type ModuloId,
} from '../acesso';
import { PERFIL_INICIAL, ordenarPorNivel, type NivelAcesso } from '../Perfil';

const MODULOS: ModuloId[] = [
  'drivers',
  'admin',
  'acesso',
  'agentes',
  'analises',
  'restricoes',
  'planos',
  'relatorios',
];

describe('podeAcessar', () => {
  it.each([
    [1, 2, false],
    [2, 2, true],
    [3, 3, true],
    [3, 4, false],
    [4, 1, true],
    [1, null, true],
    [4, null, true],
  ] as const)('nível %i com mínimo %p → %p', (nivel, minimo, esperado) => {
    expect(podeAcessar(nivel, minimo)).toBe(esperado);
  });
});

describe('moduloVisivel', () => {
  const visiveis: Record<NivelAcesso, ModuloId[]> = {
    1: ['planos', 'relatorios'],
    2: ['drivers', 'analises', 'planos', 'relatorios'],
    3: ['drivers', 'admin', 'analises', 'restricoes', 'planos', 'relatorios'],
    4: MODULOS,
  };

  it.each([1, 2, 3, 4] as const)('nível %i vê os módulos do setRole', (nivel) => {
    expect(MODULOS.filter((modulo) => moduloVisivel(nivel, modulo))).toEqual(visiveis[nivel]);
  });

  it('usa os níveis mínimos do protótipo', () => {
    expect(NIVEL_MINIMO_MODULO).toEqual({
      drivers: 2,
      admin: 3,
      acesso: 4,
      agentes: 4,
      analises: 2,
      restricoes: 3,
      planos: 1,
      relatorios: 1,
    });
  });
});

describe('itemVisivel', () => {
  it('esconde Exportar JSON abaixo de Planejador e Novo Usuário abaixo de Admin', () => {
    expect(itemVisivel(2, 'export')).toBe(false);
    expect(itemVisivel(3, 'export')).toBe(true);
    expect(itemVisivel(3, 'user-form')).toBe(false);
    expect(itemVisivel(4, 'user-form')).toBe(true);
    expect(itemVisivel(1, 'lista')).toBe(true);
  });
});

describe('upgradeNivel', () => {
  it.each([
    [1, 'area-ou-planejador'],
    [2, 'planejador'],
    [3, 'admin'],
    [4, null],
  ] as const)('nível %i → %p', (nivel, esperado) => {
    expect(upgradeNivel(nivel)).toBe(esperado);
  });
});

describe('Perfil', () => {
  it('começa em admin', () => {
    expect(PERFIL_INICIAL).toBe('admin');
  });

  it('ordena por nível decrescente de forma estável', () => {
    const perfis = [
      { id: 'b', nivel: 1 as const },
      { id: 'a', nivel: 4 as const },
      { id: 'c', nivel: 1 as const },
      { id: 'd', nivel: 3 as const },
    ];
    expect(ordenarPorNivel(perfis).map((perfil) => perfil.id)).toEqual(['a', 'd', 'b', 'c']);
    expect(perfis[0]?.id).toBe('b');
  });
});
