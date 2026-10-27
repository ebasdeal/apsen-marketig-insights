import { NotFoundError } from '@domain/shared/DomainError';

export const MAX_RETRIES = 1;

export function retryExcetoNotFound(failureCount: number, error: unknown): boolean {
  return !(error instanceof NotFoundError) && failureCount < MAX_RETRIES;
}
