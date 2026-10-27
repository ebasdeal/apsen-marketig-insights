import { CATEGORIAS, CONFIG } from '@test/factories/drivers';
import { badgeDoTipo, categoriaDoTipo, tomPorCategoria } from '../badgeTone';

describe('tomPorCategoria (RN-02 da lista, CA-07)', () => {
  it.each([
    ['midia', 'tv'],
    ['comercial', 'pdv'],
    ['produto', 'supply'],
    ['supply', 'supply'],
    ['logistica', 'canal'],
    ['concorrencia', 'conc'],
    ['regulatorio', 'reg'],
    ['sazo', 'sazo'],
    ['social', 'viral'],
    ['macro', 'macro'],
    ['outra', 'outro'],
  ])('%s → %s', (slug, tom) => {
    expect(tomPorCategoria(slug)).toBe(tom);
  });

  it('sem categoria → outro', () => {
    expect(tomPorCategoria(undefined)).toBe('outro');
  });
});

describe('badgeDoTipo', () => {
  it('rótulo curto do LABEL e tom da categoria do tipo', () => {
    expect(badgeDoTipo('tv', CATEGORIAS, CONFIG.labels)).toEqual({
      label: '📺 TV Aberta',
      tone: 'tv',
    });
    expect(badgeDoTipo('digital', CATEGORIAS, CONFIG.labels).tone).toBe('tv');
    expect(badgeDoTipo('pdv', CATEGORIAS, CONFIG.labels).tone).toBe('pdv');
  });

  it('tipo desconhecido → outro com o slug como rótulo', () => {
    expect(badgeDoTipo('xyz', CATEGORIAS, CONFIG.labels)).toEqual({ label: 'xyz', tone: 'outro' });
    expect(categoriaDoTipo('xyz', CATEGORIAS)).toBeUndefined();
    expect(categoriaDoTipo('tv', CATEGORIAS)?.id).toBe(0);
  });
});
