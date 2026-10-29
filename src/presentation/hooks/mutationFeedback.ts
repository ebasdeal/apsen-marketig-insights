import { DomainError, NotFoundError } from '@domain/shared/DomainError';

export const FALHA_SALVAR = '⚠️ Não foi possível salvar as alterações. Tente novamente.';

export function mensagemDeFalha(error: unknown): string {
  return error instanceof DomainError && !(error instanceof NotFoundError)
    ? error.message
    : FALHA_SALVAR;
}
