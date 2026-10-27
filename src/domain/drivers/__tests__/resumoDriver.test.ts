import { makeDriver } from '@test/factories/drivers';
import { estrelas, parametrosResumo, periodoTexto, tituloDoDriver } from '../resumoDriver';

describe('resumoDriver (RN-03, CA-02)', () => {
  it('estrelas cheias e vazias até 5', () => {
    expect(estrelas(4)).toBe('★★★★☆');
    expect(estrelas(5)).toBe('★★★★★');
    expect(estrelas(0)).toBe('☆☆☆☆☆');
    expect(estrelas(9)).toBe('★★★★★');
  });

  it('período com datas cruas', () => {
    expect(periodoTexto({ inicio: '2026-07-01', fim: '2026-07-31' })).toBe(
      '2026-07-01 → 2026-07-31',
    );
    expect(periodoTexto({ inicio: '', fim: '' })).toBe(' → ');
  });

  it('até 4 parâmetros com _ trocado por espaço', () => {
    const resumo = parametrosResumo({
      tipo_acao: 'Bonificação',
      b: '2',
      c: '3',
      d: '4',
      e: '5',
    });
    expect(resumo).toHaveLength(4);
    expect(resumo[0]).toEqual({ chave: 'tipo acao', valor: 'Bonificação' });
  });

  it('título "{produto} — {titulo}" com fallbacks', () => {
    expect(
      tituloDoDriver(
        makeDriver({
          produto: 'Baricitinibe 2mg (SKU-00312)',
          titulo: 'Campanha Instagram Jul/2026',
        }),
      ),
    ).toBe('Baricitinibe 2mg (SKU-00312) — Campanha Instagram Jul/2026');
    expect(tituloDoDriver({ produto: '', titulo: 'T' })).toBe('— — T');
    expect(tituloDoDriver({ produto: 'P', titulo: '' })).toBe('P');
  });
});
