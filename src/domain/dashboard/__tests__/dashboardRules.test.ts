import { barras, percentual, produtoCurto, restantesPendentes } from '../dashboardRules';

describe('dashboardRules', () => {
  it('percentual arredonda e devolve null com total 0 (RN-05)', () => {
    expect(percentual(107, 247)).toBe(43);
    expect(percentual(35, 247)).toBe(14);
    expect(percentual(0, 0)).toBeNull();
  });

  it('barras usam o maior n (mín. 1) e podem remover zeros (RN-02/RN-03)', () => {
    const contagens = [
      { chave: 'a', label: 'A', n: 3 },
      { chave: 'b', label: 'B', n: 4 },
      { chave: 'c', label: 'C', n: 0 },
    ];
    expect(barras(contagens).map((barra) => [barra.chave, barra.max])).toEqual([
      ['a', 4],
      ['b', 4],
      ['c', 4],
    ]);
    expect(barras(contagens, true).map((barra) => barra.chave)).toEqual(['a', 'b']);
    expect(barras([{ chave: 'z', label: 'Z', n: 0 }])[0]?.max).toBe(1);
  });

  it('produtoCurto corta no primeiro — e no primeiro · (RN-04)', () => {
    expect(produtoCurto('Baricitinibe 2mg — Blister 28cp')).toBe('Baricitinibe 2mg');
    expect(produtoCurto('Apixabana · Cardio')).toBe('Apixabana');
    expect(produtoCurto('Simples')).toBe('Simples');
  });

  it('restantesPendentes nunca é negativo', () => {
    expect(restantesPendentes(6, 4)).toBe(2);
    expect(restantesPendentes(2, 2)).toBe(0);
    expect(restantesPendentes(1, 4)).toBe(0);
  });
});
