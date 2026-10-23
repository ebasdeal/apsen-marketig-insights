import { clampPage, pageCount, pageRangeLabel, pageSlice, paginationItems } from '../pageRange';

describe('pageRange', () => {
  it('calcula o total de páginas com mínimo de uma', () => {
    expect(pageCount(0, 8)).toBe(1);
    expect(pageCount(8, 8)).toBe(1);
    expect(pageCount(9, 8)).toBe(2);
  });

  it('limita a página ao intervalo válido', () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(9, 3)).toBe(3);
  });

  it('fatia os itens da página', () => {
    const items = Array.from({ length: 10 }, (_, index) => index + 1);
    expect(pageSlice(items, 1, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(pageSlice(items, 2, 8)).toEqual([9, 10]);
  });

  it('monta o rótulo "Mostrando a–b de n"', () => {
    expect(pageRangeLabel(1, 8, 20)).toBe('Mostrando 1–8 de 20');
    expect(pageRangeLabel(3, 8, 20)).toBe('Mostrando 17–20 de 20');
    expect(pageRangeLabel(1, 8, 0)).toBe('Mostrando 0–0 de 0');
  });

  it('mostra primeira, última, vizinhas e reticências sem repetir', () => {
    expect(paginationItems(1, 1)).toEqual([1]);
    expect(paginationItems(1, 4)).toEqual([1, 2, 'ellipsis', 4]);
    expect(paginationItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    expect(paginationItems(10, 10)).toEqual([1, 'ellipsis', 9, 10]);
    expect(paginationItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});
