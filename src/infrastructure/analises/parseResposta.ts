import type { z } from 'zod';
import { HttpError, InvalidResponseError } from '../http/HttpClient';

const NOT_FOUND = 404;

export function parseResposta<S extends z.ZodType>(
  schema: S,
  data: unknown,
  recurso: string,
): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const campos = result.error.issues
      .map((issue) => (issue.path.length === 0 ? '(raiz)' : issue.path.join('.')))
      .join(', ');
    throw new InvalidResponseError(`Resposta de ${recurso} fora do contrato: ${campos}`);
  }
  return result.data;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === NOT_FOUND;
}
