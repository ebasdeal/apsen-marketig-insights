import type { Intensidade } from './Driver';

export interface TipoDaCategoria {
  readonly slug: string;
  readonly label: string;
}

export interface Categoria {
  readonly id: number;
  readonly label: string;
  readonly slug: string;
  readonly tipos: readonly TipoDaCategoria[];
}

export interface TipoStatus {
  readonly slug: string;
  readonly ativo: boolean;
}

export interface OpcaoAgrupada {
  readonly label: string;
  readonly group: string;
}

export type CampoOpcao = string | OpcaoAgrupada;

export type CampoTipoKind = 'text' | 'number' | 'date' | 'select' | 'autocomplete';

export type AutocompleteFonte = 'labs' | 'marcas';

export interface CampoTipo {
  readonly label: string;
  readonly required: boolean;
  readonly id: string;
  readonly param: string;
  readonly type: CampoTipoKind;
  readonly options?: readonly CampoOpcao[];
  readonly placeholder?: string;
  readonly step?: string;
  readonly readonly?: boolean;
  readonly autocomplete?: AutocompleteFonte;
  readonly labelHint?: string;
}

export interface CamposTipo {
  readonly id: string;
  readonly title: string;
  readonly layout: 'g2' | 'g3';
  readonly campos: readonly CampoTipo[];
}

export interface IntensidadeInfo {
  readonly id: Intensidade;
  readonly label: string;
  readonly faixa: string;
  readonly default: number;
  readonly desc: string;
}

export interface ChipOpcao {
  readonly value: string;
  readonly label: string;
}

export interface DriverFormConfig {
  readonly labels: Readonly<Record<string, string>>;
  readonly regioes: readonly ChipOpcao[];
  readonly canais: readonly ChipOpcao[];
  readonly canaisDefault: readonly string[];
}

export interface DriverConfig extends DriverFormConfig {
  readonly exportSchema: string;
  readonly instrucoesModelagem: readonly string[];
}
