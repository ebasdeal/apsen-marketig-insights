export interface Sku {
  readonly id: string;
  readonly label: string;
  readonly familia: string;
  readonly franquia: string;
}

export interface Familia {
  readonly id: string;
  readonly franquia: string;
  readonly skus: readonly string[];
}

export interface Franquia {
  readonly id: string;
  readonly familias: readonly string[];
}

export interface FamiliaSkus {
  readonly familia: string;
  readonly skus: readonly string[];
}
