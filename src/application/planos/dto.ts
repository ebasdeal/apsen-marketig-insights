import type { PlanoItemForm, PlanoStatus } from '@domain/planos/PlanoItem';

export interface PlanoItemRowOutput {
  id: string;
  codigo: string;
  sku: string;
  skuCurto: string;
  nome: string;
  apres: string;
  familia: string;
  qtd: number;
  linha: string;
  semana: string;
  status: PlanoStatus;
  statusLabel: string;
  editavel: boolean;
}

export interface PlanoListOutput {
  itens: PlanoItemRowOutput[];
  total: number;
  pagina: number;
  tamanho: number;
  ciclo: string | null;
}

export interface PlanoItemDetailOutput extends PlanoItemRowOutput {
  resp: string;
  obs: string;
  produtoLabel: string;
  somenteLeitura: boolean;
  form: PlanoItemForm;
}

export interface SkuOpcaoOutput {
  value: string;
  label: string;
}

export interface PlanoItemIncluidoOutput {
  id: string;
  codigo: string;
}

export interface PlanoItemAtualizadoOutput {
  codigo: string;
}

export interface ResumoPlanoOutput {
  total: number;
  porStatus: Record<PlanoStatus, number>;
}
