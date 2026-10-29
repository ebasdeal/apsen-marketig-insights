import { autoria, textoAlteracao } from '../tipoRules';

describe('autoria das alterações de tipo (RN-FRM-04)', () => {
  it('registra quem alterou e quando', () => {
    expect(autoria('Ana P.', new Date('2026-10-28T14:05:00.000Z'))).toEqual({
      alteradoPor: 'Ana P.',
      alteradoEm: '2026-10-28T14:05:00.000Z',
    });
  });

  it('formata a última alteração ou devolve null sem registro', () => {
    expect(textoAlteracao({ alteradoPor: 'Ana P.', alteradoEm: '2026-10-28T14:05:00.000Z' })).toBe(
      'Última alteração por Ana P. em 28/10/2026 14:05',
    );
    expect(textoAlteracao({ alteradoPor: '', alteradoEm: '' })).toBeNull();
  });
});
