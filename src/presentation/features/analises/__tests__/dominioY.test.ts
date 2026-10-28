import { comparacaoComVsSemDrivers } from '@domain/analises/comparacao';
import { buildAnalise } from '@test/fixtures/analises';
import { dominioY } from '../chart/buildComparacaoChart';

describe('dominioY', () => {
  it('inclui as faixas de incerteza e as duas séries com folga', () => {
    const comparacao = comparacaoComVsSemDrivers(buildAnalise());
    const valores = [
      ...comparacao.linhas.flatMap((linha) => [linha.sem, linha.com]),
      ...comparacao.incerteza.linhas.flatMap((faixa) => [faixa.min, faixa.max]),
    ];
    const dominio = dominioY(comparacao);
    expect(dominio.max).toBeGreaterThan(Math.max(...valores));
    expect(dominio.min).toBeLessThan(Math.min(...valores));
    expect(dominio.max).toBeGreaterThan(Math.max(...comparacao.incerteza.linhas.map((f) => f.max)));
  });
});
