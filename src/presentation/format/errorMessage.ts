import { NotFoundError } from '@domain/shared/DomainError';

export function toUserMessage(error: unknown): string {
  if (error instanceof NotFoundError) {
    return `${error.resource} não encontrado.`;
  }
  return 'Não foi possível carregar os dados. Verifique se a API local está no ar e tente novamente.';
}
