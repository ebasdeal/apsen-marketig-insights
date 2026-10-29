import { NotFoundError } from '@domain/shared/DomainError';
import type { z } from 'zod';
import { HttpError, InvalidResponseError } from '../http/HttpClient';

const NOT_FOUND = 404;

export function parseResponse<T extends z.ZodType>(
  schema: T,
  data: unknown,
  path: string,
): z.infer<T> {
  const result = schema.safeParse(data);
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

export async function orNotFound<T>(request: Promise<T>, resource: string, id: string): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (isNotFound(error)) {
      throw new NotFoundError(resource, id);
    }
    throw error;
  }
}

export async function orFallbackOn404<T>(request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (isNotFound(error)) {
      return fallback;
    }
    throw error;
  }
}

export function resourcePath(collection: string, id: string): string {
  return `/${collection}/${encodeURIComponent(id)}`;
}
