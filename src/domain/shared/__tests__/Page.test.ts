import { DEFAULT_PAGE_SIZE, PAGE_SIZES, pageCountOf } from '../Page';

describe('Page', () => {
  it.each([
    [0, 10, 1],
    [10, 10, 1],
    [11, 10, 2],
    [247, 25, 10],
    [5, 0, 1],
  ])('total %i com limite %i tem %i páginas', (total, limit, pages) => {
    expect(pageCountOf(total, limit)).toBe(pages);
  });

  it('expõe os tamanhos de página', () => {
    expect(PAGE_SIZES).toEqual([10, 25, 50]);
    expect(DEFAULT_PAGE_SIZE).toBe(10);
  });
});
