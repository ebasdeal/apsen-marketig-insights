export type Granularidade = 'franquia' | 'familia' | 'sku';

export type Intensidade = 1 | 2 | 3 | 4 | 5;

export const INTENSIDADE_INICIAL: Intensidade = 1;

export interface Periodo {
  readonly inicio: string;
  readonly fim: string;
}

export interface Cobertura {
  readonly regioes: readonly string[];
  readonly canais: readonly string[];
}

export interface Driver {
  readonly id: string;
  readonly modo: Granularidade;
  readonly produto: string;
  readonly molecula: string;
  readonly codigo: string;
  readonly skusAfetadosIa: readonly string[];
  readonly titulo: string;
  readonly periodo: Periodo;
  readonly tipo: string;
  readonly cobertura: Cobertura;
  readonly intensidadeEsperada: Intensidade;
  readonly upliftPct: number | null;
  readonly verbaRs: number | null;
  readonly observacoes: string;
  readonly parametros: Readonly<Record<string, string>>;
}

export function isIntensidade(valor: number): valor is Intensidade {
  return Number.isInteger(valor) && valor >= 1 && valor <= 5;
}
