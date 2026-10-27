import { variacaoPreco } from '../variacaoPreco';

describe('variacaoPreco (RN-10, CA-07)', () => {
  it('calcula a variação com 2 casas', () => {
    expect(variacaoPreco('40', '42.6')).toBe('6.50');
    expect(variacaoPreco('50', '40')).toBe('-20.00');
  });

  it.each([
    ['0', '10'],
    ['', '1'],
    ['1', ''],
    ['abc', '10'],
  ])('anterior %s e novo %s → null', (anterior, novo) => {
    expect(variacaoPreco(anterior, novo)).toBeNull();
  });
});
