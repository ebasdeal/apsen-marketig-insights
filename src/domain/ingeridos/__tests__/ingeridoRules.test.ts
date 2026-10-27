import { mockConfigOpcoes } from '@test/fixtures/mockDb';
import { INGERIDO_FILTRO_VAZIO } from '../Ingerido';
import {
  badgeVariant,
  cssVarTone,
  INGERIDOS_CATEGORIAS,
  INGERIDOS_PAGE_SIZE,
  resumoIngeridos,
} from '../ingeridoRules';

describe('ingeridoRules (RN-02)', () => {
  it('converte var(--x) em tom com fallback muted', () => {
    expect(cssVarTone('var(--teal)')).toBe('teal');
    expect(cssVarTone('var(--red)')).toBe('red');
    expect(cssVarTone('var(--rosa)')).toBe('muted');
    expect(cssVarTone('#fff')).toBe('muted');
  });

  it('converte db-* em variante com fallback outro', () => {
    expect(badgeVariant('db-sazo')).toBe('sazo');
    expect(badgeVariant('db-supply')).toBe('supply');
    expect(badgeVariant('db-xyz')).toBe('outro');
    expect(badgeVariant('sazo')).toBe('outro');
  });

  it('pluraliza o resumo', () => {
    expect(resumoIngeridos(1)).toBe('1 driver');
    expect(resumoIngeridos(0)).toBe('0 drivers');
    expect(resumoIngeridos(4)).toBe('4 drivers');
  });

  it('categorias espelham config.opcoes sem "Todas"', () => {
    expect(['Todas as categorias', ...INGERIDOS_CATEGORIAS]).toEqual(
      mockConfigOpcoes().ingeridosCategorias,
    );
    expect(INGERIDOS_PAGE_SIZE).toBe(10);
    expect(INGERIDO_FILTRO_VAZIO).toEqual({ q: '', categoria: '' });
  });
});
