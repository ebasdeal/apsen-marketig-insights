import { buildAnalise } from '@test/fixtures/analises';
import { MESES } from '../analiseConstants';
import { comparacaoComVsSemDrivers, impactoTotalDe, linhaComparacao } from '../comparacao';

describe('comparacaoComVsSemDrivers (CA-11 / RN-08)', () => {
  it('ANL-001: seed 49, impacto 15 e fórmulas do protótipo', () => {
    const analise = buildAnalise();
    expect('ANL-001'.charCodeAt(6)).toBe(49);
    expect(impactoTotalDe(analise)).toBe(15);

    const { linhas, total } = comparacaoComVsSemDrivers(analise);
    const sem0 = Math.round(74300 * (1 + 0) * (1 + Math.sin(14.7) * 0.04));
    expect(linhas).toHaveLength(12);
    expect(linhas.map((linha) => linha.mes)).toEqual([...MESES]);
    expect(linhas[0]?.sem).toBe(sem0);
    expect(linhas[0]?.com).toBe(Math.round(sem0 * (1 + 0.15 * 0.375)));

    const sem7 = Math.round(74300 * 1.25 * (1 + Math.sin(7 * 0.5 + 49 * 0.3) * 0.04));
    expect(linhas[7]?.sem).toBe(sem7);
    expect(linhas[7]?.com).toBe(Math.round(sem7 * 1.15));

    const linha0 = linhas[0]!;
    expect(linha0.deltaUn).toBe(linha0.com - linha0.sem);
    expect(linha0.deltaPct).toBe(Math.round((linha0.deltaUn / linha0.sem) * 100 * 10) / 10);

    const somaSem = linhas.reduce((soma, linha) => soma + linha.sem, 0);
    const somaCom = linhas.reduce((soma, linha) => soma + linha.com, 0);
    expect(total).toEqual({
      sem: somaSem,
      com: somaCom,
      deltaUn: somaCom - somaSem,
      deltaPct: Math.round(((somaCom - somaSem) / somaSem) * 1000) / 10,
    });
  });

  it('impactos somando 0 (ou ausentes) usam 14', () => {
    expect(
      impactoTotalDe(
        buildAnalise({
          driversImpacto: [
            { id: 'a', tipo: 'x', impacto: 5, dir: 'up', conf: 1 },
            { id: 'b', tipo: 'y', impacto: -5, dir: 'down', conf: 1 },
          ],
        }),
      ),
    ).toBe(14);
    expect(impactoTotalDe(buildAnalise({ driversImpacto: [] }))).toBe(14);
  });

  it('é determinística e muda com o último caractere do código', () => {
    const a = comparacaoComVsSemDrivers(buildAnalise());
    const b = comparacaoComVsSemDrivers(buildAnalise());
    const c = comparacaoComVsSemDrivers(buildAnalise({ codigo: 'ANL-002' }));
    expect(a).toEqual(b);
    expect(c.linhas[0]?.sem).not.toBe(a.linhas[0]?.sem);
  });

  it('código vazio usa seed 1', () => {
    const { linhas } = comparacaoComVsSemDrivers(buildAnalise({ codigo: '' }));
    expect(linhas[0]?.sem).toBe(Math.round(40700 * (1 + Math.sin(0.3) * 0.04)));
  });

  it('linha: delta em unidades e % com 1 casa; baseline 0 deixa deltaPct nulo', () => {
    expect(linhaComparacao('Jan', 1000, 1135)).toEqual({
      mes: 'Jan',
      sem: 1000,
      com: 1135,
      deltaUn: 135,
      deltaPct: 13.5,
    });
    expect(linhaComparacao('Fev', 3000, 2900).deltaPct).toBe(-3.3);
    expect(linhaComparacao('Mar', 0, 10).deltaPct).toBeNull();
  });
});

describe('incerteza da previsão (ANL-20, RN §2.1)', () => {
  it('toda linha traz faixa de 80% em torno da previsão com drivers, crescendo com o horizonte', () => {
    const { linhas, incerteza } = comparacaoComVsSemDrivers(buildAnalise());
    expect(incerteza.nivel).toBe(80);
    expect(incerteza.linhas).toHaveLength(linhas.length);
    incerteza.linhas.forEach((faixa, i) => {
      expect(faixa.min).toBeLessThan(linhas[i]!.com);
      expect(faixa.max).toBeGreaterThan(linhas[i]!.com);
    });
    const largura = (i: number) => incerteza.linhas[i]!.max - incerteza.linhas[i]!.min;
    expect(largura(11) / linhas[11]!.com).toBeGreaterThan(largura(0) / linhas[0]!.com);
    expect(incerteza.total.min).toBe(incerteza.linhas.reduce((soma, faixa) => soma + faixa.min, 0));
  });

  it('é determinística', () => {
    const analise = buildAnalise();
    expect(comparacaoComVsSemDrivers(analise).incerteza).toEqual(
      comparacaoComVsSemDrivers(analise).incerteza,
    );
  });
});
