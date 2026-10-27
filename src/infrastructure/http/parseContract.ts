import type { z } from 'zod';
import { HttpError, InvalidResponseError } from './HttpClient';

const NOT_FOUND = 404;

export function parseContract<T extends z.ZodType>(
  schema: T,
  payload: unknown,
  path: string,
): z.output<T> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const campos = result.error.issues
      .map((issue) => (issue.path.length === 0 ? '(raiz)' : issue.path.join('.')))
      .join(', ');
    throw new InvalidResponseError(`Resposta de ${path} fora do contrato: ${campos}`);
  }
  return result.data;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === NOT_FOUND;
}
