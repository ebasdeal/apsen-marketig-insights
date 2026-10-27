import { DomainError } from '../shared/DomainError';

export type TipoCampoValidado = 'slug' | 'label' | 'cat' | 'dono' | 'lag';

export interface TipoValidation {
  fields: Partial<Record<TipoCampoValidado, string>>;
  rows: Record<string, string>;
}

export class TipoValidationError extends DomainError {
  readonly fields: TipoValidation['fields'];
  readonly rows: TipoValidation['rows'];

  constructor(validation: TipoValidation, message: string) {
    super(message);
    this.fields = validation.fields;
    this.rows = validation.rows;
  }
}

export class CatalogoImportError extends DomainError {}
