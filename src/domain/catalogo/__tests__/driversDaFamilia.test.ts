import { LEVOXIN_SKUS } from '@test/factories/catalogo';
import { makeDriver } from '@test/factories/drivers';
import { contarDrivers, driversDaFamilia } from '../driversDaFamilia';

const vazio = { molecula: '', codigo: '', produto: '' };

describe('driversDaFamilia (RN-02 do catálogo)', () => {
  it('casa por molécula', () => {
    const driver = makeDriver({ ...vazio, molecula: 'LEVOXIN' });
    expect(contarDrivers([driver], 'ASTER', 'LEVOXIN', [])).toBe(1);
  });

  it('driver de franquia entra em todas as famílias da franquia', () => {
    const driver = makeDriver({ ...vazio, modo: 'franquia', molecula: 'ASTER' });
    expect(contarDrivers([driver], 'ASTER', 'LEVOXIN', [])).toBe(1);
    expect(contarDrivers([driver], 'ASTER', 'FEMELIV', [])).toBe(1);
    expect(contarDrivers([driver], 'LYRA', 'ALOIS', [])).toBe(0);
    expect(contarDrivers([{ ...driver, modo: 'sku' }], 'ASTER', 'LEVOXIN', [])).toBe(0);
  });

  it('casa pelo código contido no SKU', () => {
    const driver = makeDriver({ ...vazio, codigo: '2300' });
    expect(contarDrivers([driver], 'ASTER', 'LEVOXIN', LEVOXIN_SKUS)).toBe(1);
    expect(contarDrivers([driver], 'ASTER', 'FEMELIV', ['FEMELIV 1 (9999)'])).toBe(0);
  });

  it('casa pelo produto sem o código, inclusive por substring', () => {
    const levoxin = makeDriver({ ...vazio, produto: 'LEVOXIN (Família)' });
    expect(contarDrivers([levoxin], 'ASTER', 'LEVOXIN', LEVOXIN_SKUS)).toBe(1);
    const retemic = makeDriver({ ...vazio, produto: 'RETEMIC (Família)' });
    expect(contarDrivers([retemic], 'ASTER', 'RETEMIC UD', ['RETEMIC UD 5MG (2255)'])).toBe(1);
    const curto = makeDriver({ ...vazio, produto: 'RETEMIC UD 5MG EXTRA (1)' });
    expect(contarDrivers([curto], 'ASTER', 'RETEMIC UD', ['RETEMIC UD 5MG (2255)'])).toBe(1);
  });

  it('produto vazio não casa e a ordem da API é mantida', () => {
    const vazioDriver = makeDriver({ ...vazio });
    expect(contarDrivers([vazioDriver], 'ASTER', 'LEVOXIN', LEVOXIN_SKUS)).toBe(0);
    const a = makeDriver({ ...vazio, id: 'a', molecula: 'LEVOXIN' });
    const b = makeDriver({ ...vazio, id: 'b', codigo: '2298' });
    expect(driversDaFamilia([b, vazioDriver, a], 'ASTER', 'LEVOXIN', LEVOXIN_SKUS)).toEqual([b, a]);
  });
});
