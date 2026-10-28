import { DomainError, NotFoundError } from '@domain/shared/DomainError';

export const FALHA_ESCRITA_ANALISE = '⚠️ Não foi possível salvar. Tente novamente.';

export function mensagemFalhaAnalise(error: unknown): string {
  return error instanceof DomainError && !(error instanceof NotFoundError)
    ? error.message
    : FALHA_ESCRITA_ANALISE;
}
