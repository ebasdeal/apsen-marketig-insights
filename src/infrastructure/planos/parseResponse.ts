import type { z } from 'zod';
import { InvalidResponseError } from '../http/HttpClient';

export function parseResponse<T>(schema: z.ZodType<T>, payload: unknown, recurso: string): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new InvalidResponseError(`Resposta inválida de /${recurso}`);
  }
  return result.data;
}
