import { DomainError } from '../shared/DomainError';

export type PlanoCampo = 'sku' | 'qtd';

export class PlanoInvalidoError extends DomainError {
  constructor(
    message: string,
    readonly campo: PlanoCampo,
  ) {
    super(message);
  }
}

export class PlanoSemCicloError extends DomainError {
  constructor() {
    super('⚠️ Nenhum ciclo ativo para gerar o código.');
  }
}
