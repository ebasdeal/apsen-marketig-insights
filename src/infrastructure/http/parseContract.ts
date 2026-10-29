import type { z } from 'zod';
import { HttpError, InvalidResponseError } from './HttpClient';

export function parseContract<S extends z.ZodType>(
  schema: S,
  payload: unknown,
  recurso: string,
): z.infer<S> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const campos = result.error.issues
      .map((issue) => (issue.path.length === 0 ? '(raiz)' : issue.path.join('.')))
      .join(', ');
    throw new InvalidResponseError(`Resposta de ${recurso} fora do contrato: ${campos}`);
  }
  return result.data;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404;
}
