import type { Analise, Comparacao, FaixaIncerteza, LinhaComparacao } from './Analise';
import { CRESCIMENTO, IMPACTO_PADRAO, MESES } from './analiseConstants';

function seedDe(codigo: string): number {
  return codigo.length === 0 ? 1 : codigo.charCodeAt(codigo.length - 1);
}

function arredondar1(valor: number): number {
  return Math.round(valor * 10) / 10;
}

function deltaPct(delta: number, sem: number): number | null {
  return sem === 0 ? null : arredondar1((delta / sem) * 100);
}

function fatorImpacto(impactoTotal: number, mes: number): number {
  const rampa = Math.max(0.3, Math.min(1, (mes + 3) / 8));
  return 1 + (impactoTotal / 100) * rampa;
}

export const NIVEL_INCERTEZA = 80;

const MARGEM_BASE = 0.05;
const MARGEM_POR_MES = 0.01;

export function faixaDaPrevisao(com: number, mes: number): FaixaIncerteza {
  const margem = MARGEM_BASE + MARGEM_POR_MES * mes;
  return { min: Math.round(com * (1 - margem)), max: Math.round(com * (1 + margem)) };
}

export function linhaComparacao(mes: string, sem: number, com: number): LinhaComparacao {
  const deltaUn = com - sem;
  return { mes, sem, com, deltaUn, deltaPct: deltaPct(deltaUn, sem) };
}

export function impactoTotalDe(analise: Pick<Analise, 'driversImpacto'>): number {
  return (
    analise.driversImpacto.reduce((soma, driver) => soma + driver.impacto, 0) || IMPACTO_PADRAO
  );
}

export function comparacaoComVsSemDrivers(
  analise: Pick<Analise, 'codigo' | 'driversImpacto'>,
): Comparacao {
  const seed = seedDe(analise.codigo);
  const impactoTotal = impactoTotalDe(analise);
  const base = 40000 + seed * 700;
  const linhas = MESES.map((mes, i) => {
    const crescimento = CRESCIMENTO[i] ?? 0;
    const sem = Math.round(base * (1 + crescimento) * (1 + Math.sin(i * 0.5 + seed * 0.3) * 0.04));
    const com = Math.round(sem * fatorImpacto(impactoTotal, i));
    return linhaComparacao(mes, sem, com);
  });
  const sem = linhas.reduce((soma, item) => soma + item.sem, 0);
  const com = linhas.reduce((soma, item) => soma + item.com, 0);
  const totalLinha = linhaComparacao('', sem, com);
  const faixas = linhas.map((linha, i) => faixaDaPrevisao(linha.com, i));
  return {
    incerteza: {
      nivel: NIVEL_INCERTEZA,
      linhas: faixas,
      total: {
        min: faixas.reduce((soma, faixa) => soma + faixa.min, 0),
        max: faixas.reduce((soma, faixa) => soma + faixa.max, 0),
      },
    },
    linhas,
    total: {
      sem: totalLinha.sem,
      com: totalLinha.com,
      deltaUn: totalLinha.deltaUn,
      deltaPct: totalLinha.deltaPct,
    },
  };
}
