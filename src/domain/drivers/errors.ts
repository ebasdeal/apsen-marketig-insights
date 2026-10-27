import { DomainError } from '../shared/DomainError';
import type { DraftCampo } from './draft';
import type { DraftErro } from './validarDraft';

export class DriverValidationError extends DomainError {
  readonly field: DraftCampo;
  readonly fieldMessage: string;

  constructor(erro: DraftErro) {
    super(erro.toast);
    this.field = erro.campo;
    this.fieldMessage = erro.mensagem;
  }
}
