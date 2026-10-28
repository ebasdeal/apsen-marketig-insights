import { z } from 'zod';

export const DEFAULT_API_URL = 'http://localhost:3001';

function blankToUndefined(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(blankToUndefined, z.url().default(DEFAULT_API_URL)),
  NEXT_PUBLIC_AUTH_MODE: z.preprocess(blankToUndefined, z.enum(['simulado', 'entra']).optional()),
  NEXT_PUBLIC_AMBIENTE: z.preprocess(blankToUndefined, z.string().optional()),
  NEXT_PUBLIC_SUPORTE_URL: z.preprocess(blankToUndefined, z.url().optional()),
  NODE_ENV: z.string().optional(),
});

export type AuthMode = 'simulado' | 'entra';

export const DEFAULT_AMBIENTE = 'Desenvolvimento';

export interface AppEnv {
  apiUrl: string;
  authMode: AuthMode;
}

export interface LoginEnv {
  ambiente: string;
  suporteUrl: string | undefined;
}

export type EnvSource = Record<string, string | undefined>;

export class InvalidEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEnvError';
  }
}

function parseSchema(source: EnvSource) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new InvalidEnvError(`Variáveis de ambiente inválidas: ${details}`);
  }
  return result.data;
}

export function parseLoginEnv(source: EnvSource): LoginEnv {
  const data = parseSchema(source);
  return {
    ambiente: data.NEXT_PUBLIC_AMBIENTE ?? DEFAULT_AMBIENTE,
    suporteUrl: data.NEXT_PUBLIC_SUPORTE_URL,
  };
}

export function parseEnv(source: EnvSource): AppEnv {
  const data = parseSchema(source);
  const production = data.NODE_ENV === 'production';
  return {
    apiUrl: data.NEXT_PUBLIC_API_URL.replace(/\/+$/, ''),
    authMode: production ? 'entra' : (data.NEXT_PUBLIC_AUTH_MODE ?? 'simulado'),
  };
}

export function readProcessEnv(): EnvSource {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH_MODE: process.env.NEXT_PUBLIC_AUTH_MODE,
    NEXT_PUBLIC_AMBIENTE: process.env.NEXT_PUBLIC_AMBIENTE,
    NEXT_PUBLIC_SUPORTE_URL: process.env.NEXT_PUBLIC_SUPORTE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };
}
