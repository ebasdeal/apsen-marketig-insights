import { makeFranquia } from '@test/factories/catalogo';
import {
  aplicarFranquia,
  familiasPorFranquia,
  normalizarBusca,
  opcoesFamilia,
  opcoesFranquia,
} from '../filtrosCatalogo';

const FRANQUIAS = [
  makeFranquia({ id: 'LYRA', familias: ['ZETA', 'ALOIS'] }),
  makeFranquia({ id: 'ASTER', familias: ['LEVOXIN', 'FEMELIV', 'FEMELIV'] }),
];

describe('filtrosCatalogo (RN-04, CA-03)', () => {
  it('franquias ordenadas', () => {
    expect(opcoesFranquia(FRANQUIAS)).toEqual(['ASTER', 'LYRA']);
  });

  it('famílias por franquia ordenadas', () => {
    expect(familiasPorFranquia(FRANQUIAS)).toEqual({
      ASTER: ['FEMELIV', 'FEMELIV', 'LEVOXIN'],
      LYRA: ['ALOIS', 'ZETA'],
    });
  });

  it('sem franquia, grupos por franquia; com franquia, só as dela', () => {
    expect(opcoesFamilia(FRANQUIAS, '')).toEqual([
      { franquia: 'ASTER', familias: ['FEMELIV', 'FEMELIV', 'LEVOXIN'] },
      { franquia: 'LYRA', familias: ['ALOIS', 'ZETA'] },
    ]);
    expect(opcoesFamilia(FRANQUIAS, 'LYRA')).toEqual(['ALOIS', 'ZETA']);
    expect(opcoesFamilia(FRANQUIAS, 'X')).toEqual([]);
  });

  it('escolher franquia que não contém a família limpa a família', () => {
    const filtros = { busca: 'lev', franquia: '', familia: 'LEVOXIN' };
    expect(aplicarFranquia(filtros, 'LYRA', FRANQUIAS)).toEqual({
      busca: 'lev',
      franquia: 'LYRA',
      familia: '',
    });
    expect(aplicarFranquia(filtros, 'ASTER', FRANQUIAS).familia).toBe('LEVOXIN');
    expect(aplicarFranquia(filtros, '', FRANQUIAS).familia).toBe('LEVOXIN');
  });

  it('normaliza a busca com trim', () => {
    expect(normalizarBusca('  lev ')).toBe('lev');
  });
});
