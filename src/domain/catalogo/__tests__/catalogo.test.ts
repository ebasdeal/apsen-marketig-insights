import { makeSku } from '@test/factories/catalogo';
import { tomDaFranquia } from '../franquiaTone';
import { nivelDoDriver } from '../nivel';
import { tagDoSku } from '../skuLabel';

describe('tomDaFranquia (RN-10)', () => {
  it.each([
    ['ASTER', 'aster'],
    ['LYRA', 'lyra'],
    ['POLARIS', 'polaris'],
    ['SAGITA', 'sagita'],
    ['SIRIUS', 'sirius'],
    ['SOLARIS', 'solaris'],
    ['OUTRA', 'default'],
  ])('%s → %s', (id, tom) => {
    expect(tomDaFranquia(id)).toBe(tom);
  });
});

describe('nivelDoDriver (RN-08)', () => {
  it('rótulo e tom por modo', () => {
    expect(nivelDoDriver('sku')).toEqual({ label: 'SKU', tone: 'sku' });
    expect(nivelDoDriver('franquia')).toEqual({ label: 'Franquia', tone: 'franquia' });
    expect(nivelDoDriver('familia')).toEqual({ label: 'Família', tone: 'familia' });
  });
});

describe('tagDoSku (CA-04)', () => {
  it('"{FAMÍLIA} ({FRANQUIA})"', () => {
    expect(tagDoSku(makeSku())).toBe('LEVOXIN (ASTER)');
  });
});
