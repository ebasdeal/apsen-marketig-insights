import {
  CodigoInvalidoError,
  SessaoExpiradaError,
  UsuarioNaoCadastradoError,
} from '@domain/auth/AuthErrors';
import type { AuthRepository } from '@domain/auth/AuthRepository';
import type { Sessao, UsuarioSessao } from '@domain/auth/Sessao';
import type { z } from 'zod';
import { HttpError, InvalidResponseError, type HttpClient } from '../http/HttpClient';
import { meResponseSchema, tokenResponseSchema } from './authSchema';

export const TOKEN_PATH = '/auth/token';

const TOKEN_ERRORS: Record<number, () => Error> = {
  400: () => new CodigoInvalidoError(),
  401: () => new CodigoInvalidoError(),
  403: () => new UsuarioNaoCadastradoError(),
};

function parse<T extends z.ZodType>(schema: T, payload: unknown, path: string): z.infer<T> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const campos = result.error.issues
      .map((issue) => (issue.path.length === 0 ? '(raiz)' : issue.path.join('.')))
      .join(', ');
    throw new InvalidResponseError(`Resposta de ${path} fora do contrato: ${campos}`);
  }
  return result.data;
}

function translate(error: unknown, table: Record<number, () => Error>): never {
  if (error instanceof HttpError) {
    const build = table[error.status];
    if (build !== undefined) {
      throw build();
    }
  }
  throw error;
}

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async trocarCodigo(code: string): Promise<Sessao> {
    const payload = await this.http
      .post(TOKEN_PATH, { code })
      .catch((error: unknown) => translate(error, TOKEN_ERRORS));
    return parse(tokenResponseSchema, payload, TOKEN_PATH);
  }

  async me(): Promise<UsuarioSessao> {
    const payload = await this.http
      .get('/auth/me')
      .catch((error: unknown) => translate(error, { 401: () => new SessaoExpiradaError() }));
    return parse(meResponseSchema, payload, '/auth/me').usuario;
  }

  async logout(): Promise<void> {
    await this.http.post('/auth/logout', {});
  }
}
