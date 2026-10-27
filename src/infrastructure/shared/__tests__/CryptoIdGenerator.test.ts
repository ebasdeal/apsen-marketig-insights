import { CryptoIdGenerator } from '../CryptoIdGenerator';

describe('CryptoIdGenerator', () => {
  it('gera UUIDs v4 distintos', () => {
    const ids = new CryptoIdGenerator();
    const a = ids.next();
    const b = ids.next();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a).not.toBe(b);
  });
});
