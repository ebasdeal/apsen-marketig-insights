import { CryptoIdGenerator } from '../CryptoIdGenerator';

describe('CryptoIdGenerator', () => {
  it('gera UUIDs v4 distintos', () => {
    const generator = new CryptoIdGenerator();
    const first = generator.next();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(generator.next()).not.toBe(first);
  });
});
