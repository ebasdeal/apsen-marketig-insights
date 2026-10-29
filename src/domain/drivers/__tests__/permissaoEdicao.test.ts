import { podeEditarDriver } from '../permissaoEdicao';

describe('podeEditarDriver (PRG-DRV-23)', () => {
  it('Área edita só tipos da sua área; Planejador e Admin editam qualquer um', () => {
    expect(podeEditarDriver('area', 'Marketing', 'Marketing')).toBe(true);
    expect(podeEditarDriver('area', 'marketing ', 'Marketing')).toBe(true);
    expect(podeEditarDriver('area', 'Marketing', 'Comercial')).toBe(false);
    expect(podeEditarDriver('area', 'Marketing', undefined)).toBe(false);
    expect(podeEditarDriver('planejador', 'S&OP', 'Marketing')).toBe(true);
    expect(podeEditarDriver('admin', 'S&OP', undefined)).toBe(true);
  });
});
